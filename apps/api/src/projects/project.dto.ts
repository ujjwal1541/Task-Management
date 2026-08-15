import { IsIn, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TASK_PRIORITIES } from '../tasks/task.dto';

export class CreateProjectDto {
  @IsString() @MinLength(1) @MaxLength(120) name!: string;
  @IsOptional() @IsIn(TASK_PRIORITIES as unknown as string[]) priority?: string;
  @IsOptional() @IsISO8601() dueDate?: string;
  @IsOptional() @IsString() leadId?: string;
}

export class UpdateProjectDto extends CreateProjectDto {
  @IsOptional() @IsString() @MinLength(1) declare name: string;
}
