import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class MoveTaskStatusDto {
  @IsEnum(Status)
  status!: Status;
}
