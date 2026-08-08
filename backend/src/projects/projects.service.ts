import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { TasksService } from '../tasks/tasks.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  findAll() {
    return this.prisma.project.findMany({
      include: { lead: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { lead: true },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async create(dto: CreateProjectDto) {
    return this.withCleanFkErrors(() =>
      this.prisma.project.create({
        data: {
          name: dto.name,
          priority: dto.priority,
          dueDate: dto.dueDate,
          lead: dto.leadId ? { connect: { id: dto.leadId } } : undefined,
        },
        include: { lead: true },
      }),
    );
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.withCleanFkErrors(() =>
      this.prisma.project.update({
        where: { id },
        data: {
          name: dto.name,
          priority: dto.priority,
          dueDate: dto.dueDate,
          lead:
            dto.leadId !== undefined
              ? { connect: { id: dto.leadId } }
              : undefined,
        },
        include: { lead: true },
      }),
    );
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
  }

  /**
   * Matches the "Projects > Design Homepage" breadcrumb view in the Figma:
   * tasks for this project, grouped by Kanban column. Always returns every
   * status key (even empty ones) so the frontend can render all columns
   * without special-casing missing keys.
   */
  async tasksGroupedByStatus(id: string) {
    await this.findOne(id);
    const tasks = await this.prisma.task.findMany({
      where: { projectId: id },
      include: { assignees: true, labels: true },
      orderBy: { createdAt: 'desc' },
    });

    const grouped = Object.fromEntries(
      Object.values(Status).map((status) => [status, [] as typeof tasks]),
    ) as Record<Status, typeof tasks>;

    for (const task of tasks) {
      grouped[task.status].push(task);
    }
    return grouped;
  }

  async createTask(projectId: string, dto: CreateTaskDto) {
    await this.findOne(projectId);
    return this.tasksService.create({ ...dto, projectId });
  }

  private async withCleanFkErrors<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === 'P2025' || err.code === 'P2003')
      ) {
        throw new BadRequestException('leadId does not reference a valid user');
      }
      throw err;
    }
  }
}
