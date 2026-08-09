import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskStatusDto } from './dto/move-task-status.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const TASK_INCLUDE = {
  project: true,
  assignees: true,
  labels: true,
  subtasks: true,
  comments: {
    include: { author: true },
    orderBy: { createdAt: 'asc' as const },
  },
};

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof TASK_INCLUDE;
}>;

// Only these fields get an activity log entry — matches what the Figma's
// "Updates" panel actually shows, not every editable field on Task.
type TrackedField =
  'status' | 'priority' | 'startDate' | 'dueDate' | 'assignee';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: QueryTaskDto) {
    const where: Prisma.TaskWhereInput = {
      projectId: query.projectId,
      status: query.status,
      priority: query.priority,
      assignees: query.assigneeId
        ? { some: { id: query.assigneeId } }
        : undefined,
    };
    return this.prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto) {
    return this.withCleanFkErrors(() =>
      this.prisma.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          startDate: dto.startDate,
          dueDate: dto.dueDate,
          resourceUrl: dto.resourceUrl,
          project: dto.projectId
            ? { connect: { id: dto.projectId } }
            : undefined,
          assignees: dto.assigneeIds
            ? { connect: dto.assigneeIds.map((id) => ({ id })) }
            : undefined,
          labels: dto.labelIds
            ? { connect: dto.labelIds.map((id) => ({ id })) }
            : undefined,
        },
        include: TASK_INCLUDE,
      }),
    );
  }

  async update(id: string, dto: UpdateTaskDto) {
    const existing = await this.findOne(id);
    const updated = await this.withCleanFkErrors(() =>
      this.prisma.task.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          startDate: dto.startDate,
          dueDate: dto.dueDate,
          resourceUrl: dto.resourceUrl,
          project:
            dto.projectId !== undefined
              ? { connect: { id: dto.projectId } }
              : undefined,
          assignees: dto.assigneeIds
            ? { set: dto.assigneeIds.map((id) => ({ id })) }
            : undefined,
          labels: dto.labelIds
            ? { set: dto.labelIds.map((id) => ({ id })) }
            : undefined,
        },
        include: TASK_INCLUDE,
      }),
    );
    await this.logTrackedChanges(existing, updated);
    return updated;
  }

  async updateStatus(id: string, dto: MoveTaskStatusDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: dto.status },
      include: TASK_INCLUDE,
    });
    await this.logTrackedChanges(existing, updated);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
  }

  async getActivity(taskId: string) {
    await this.assertExists(taskId);
    return this.prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Confirms a task exists, for use by nested Subtask/Comment modules. */
  async assertExists(id: string) {
    const exists = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }

  private async logTrackedChanges(
    before: TaskWithRelations,
    after: TaskWithRelations,
  ) {
    const entries: {
      field: TrackedField;
      oldValue: string | null;
      newValue: string | null;
    }[] = [];

    if (before.status !== after.status) {
      entries.push({
        field: 'status',
        oldValue: before.status,
        newValue: after.status,
      });
    }
    if (before.priority !== after.priority) {
      entries.push({
        field: 'priority',
        oldValue: before.priority,
        newValue: after.priority,
      });
    }

    const beforeStart = before.startDate?.toISOString() ?? null;
    const afterStart = after.startDate?.toISOString() ?? null;
    if (beforeStart !== afterStart) {
      entries.push({
        field: 'startDate',
        oldValue: beforeStart,
        newValue: afterStart,
      });
    }

    const beforeDue = before.dueDate?.toISOString() ?? null;
    const afterDue = after.dueDate?.toISOString() ?? null;
    if (beforeDue !== afterDue) {
      entries.push({
        field: 'dueDate',
        oldValue: beforeDue,
        newValue: afterDue,
      });
    }

    const beforeAssigneeIds = before.assignees
      .map((a) => a.id)
      .sort()
      .join(',');
    const afterAssigneeIds = after.assignees
      .map((a) => a.id)
      .sort()
      .join(',');
    if (beforeAssigneeIds !== afterAssigneeIds) {
      entries.push({
        field: 'assignee',
        oldValue:
          before.assignees.map((a) => a.name ?? a.email).join(', ') || null,
        newValue:
          after.assignees.map((a) => a.name ?? a.email).join(', ') || null,
      });
    }

    if (entries.length > 0) {
      await this.prisma.taskActivity.createMany({
        data: entries.map((e) => ({ taskId: after.id, ...e })),
      });
    }
  }

  /** Converts Prisma FK-violation errors (bad projectId/assigneeIds/labelIds) into 400s. */
  private async withCleanFkErrors<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === 'P2025' || err.code === 'P2003')
      ) {
        throw new BadRequestException(
          'One or more referenced ids (projectId, assigneeIds, labelIds) do not exist',
        );
      }
      throw err;
    }
  }
}
