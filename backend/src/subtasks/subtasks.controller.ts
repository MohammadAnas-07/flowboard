import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { SubtasksService } from './subtasks.service';

@Controller('tasks/:taskId/subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.subtasksService.findAllForTask(taskId);
  }

  @Get(':id')
  findOne(@Param('taskId') taskId: string, @Param('id') id: string) {
    return this.subtasksService.findOne(taskId, id);
  }

  @Post()
  create(@Param('taskId') taskId: string, @Body() dto: CreateSubtaskDto) {
    return this.subtasksService.create(taskId, dto);
  }

  @Patch(':id')
  update(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubtaskDto,
  ) {
    return this.subtasksService.update(taskId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('taskId') taskId: string, @Param('id') id: string) {
    return this.subtasksService.remove(taskId, id);
  }
}
