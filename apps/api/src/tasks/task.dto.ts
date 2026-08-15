import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsIn, IsInt, IsISO8601, IsOptional, IsString, MaxLength, MinLength,
} from 'class-validator';

export const TASK_STATUSES = ['To Do', 'Doing', 'Completed', 'On Hold'] as const;
export const TASK_PRIORITIES = ['none', 'urgent', 'high', 'medium', 'low'] as const;

export class CreateTaskDto {
  @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsIn(TASK_STATUSES as unknown as string[]) status?: string;
  @IsOptional() @IsIn(TASK_PRIORITIES as unknown as string[]) priority?: string;
  @IsOptional() @IsISO8601() dueDate?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) labels?: string[];
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() reporter?: string;
  @IsOptional() @Type(() => Number) @IsInt() order?: number;
}

export class UpdateTaskDto extends CreateTaskDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(160) declare title: string;
}

export class QueryTaskDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsIn(TASK_STATUSES as unknown as string[]) status?: string;
  @IsOptional() @IsIn(TASK_PRIORITIES as unknown as string[]) priority?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeSubtasks?: boolean;
}

export class CreateCommentDto {
  @IsString() @MinLength(1) @MaxLength(1000) body!: string;
}
