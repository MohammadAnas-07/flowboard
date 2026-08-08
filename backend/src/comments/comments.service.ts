import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  async findAllForTask(taskId: string) {
    await this.tasksService.assertExists(taskId);
    return this.prisma.comment.findMany({
      where: { taskId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(taskId: string, authorId: string, dto: CreateCommentDto) {
    await this.tasksService.assertExists(taskId);
    return this.prisma.comment.create({
      data: {
        body: dto.body,
        task: { connect: { id: taskId } },
        author: { connect: { id: authorId } },
      },
      include: { author: true },
    });
  }
}
