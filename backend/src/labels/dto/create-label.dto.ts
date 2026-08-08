import { IsString, Length } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @Length(1, 50)
  name!: string;
}
