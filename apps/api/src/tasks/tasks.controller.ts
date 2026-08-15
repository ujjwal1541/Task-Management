import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateCommentDto, CreateTaskDto, QueryTaskDto, UpdateTaskDto } from './task.dto';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get() findAll(@Query() query: QueryTaskDto) { return this.tasks.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.tasks.findOne(id); }
  @Post() create(@Body() dto: CreateTaskDto) { return this.tasks.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTaskDto) { return this.tasks.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.tasks.remove(id); }

  @Post(':id/comments')
  comment(@Param('id') id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: { id: string }) {
    return this.tasks.addComment(id, user.id, dto);
  }
}
