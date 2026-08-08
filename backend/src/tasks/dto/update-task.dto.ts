import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

// Full edit surface, including status — the dedicated PATCH /:id/status
// endpoint exists for the board's drag-and-drop use case specifically,
// not because status can't also be changed via a normal edit.
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
