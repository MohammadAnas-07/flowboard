import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  async findAllForTask(taskId: string) {
    await this.tasksService.assertExists(taskId);
    return this.prisma.subtask.findMany({
      where: { parentTaskId: taskId },
      include: { assignees: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(taskId: string, id: string) {
    const subtask = await this.prisma.subtask.findFirst({
      where: { id, parentTaskId: taskId },
      include: { assignees: true },
    });
    if (!subtask) {
      throw new NotFoundException(`Subtask ${id} not found on task ${taskId}`);
    }
    return subtask;
  }

  async create(taskId: string, dto: CreateSubtaskDto) {
    await this.tasksService.assertExists(taskId);
    return this.withCleanFkErrors(() =>
      this.prisma.subtask.create({
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          startDate: dto.startDate,
          dueDate: dto.dueDate,
          parentTask: { connect: { id: taskId } },
          assignees: dto.assigneeIds
            ? { connect: dto.assigneeIds.map((id) => ({ id })) }
            : undefined,
        },
        include: { assignees: true },
      }),
    );
  }

  async update(taskId: string, id: string, dto: UpdateSubtaskDto) {
    await this.findOne(taskId, id);
    return this.withCleanFkErrors(() =>
      this.prisma.subtask.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          startDate: dto.startDate,
          dueDate: dto.dueDate,
          assignees: dto.assigneeIds
            ? { set: dto.assigneeIds.map((id) => ({ id })) }
            : undefined,
        },
        include: { assignees: true },
      }),
    );
  }

  async remove(taskId: string, id: string) {
    await this.findOne(taskId, id);
    await this.prisma.subtask.delete({ where: { id } });
  }

  private async withCleanFkErrors<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === 'P2025' || err.code === 'P2003')
      ) {
        throw new BadRequestException(
          'One or more referenced assigneeIds do not exist',
        );
      }
      throw err;
    }
  }
}
