import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskStatusDto } from './dto/move-task-status.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query() query: QueryTaskDto) {
    return this.tasksService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // Powers the task detail page's "Updates" panel.
  @Get(':id/activity')
  getActivity(@Param('id') id: string) {
    return this.tasksService.getActivity(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  // Dedicated, minimal-payload endpoint for the board's drag-and-drop.
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: MoveTaskStatusDto) {
    return this.tasksService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
