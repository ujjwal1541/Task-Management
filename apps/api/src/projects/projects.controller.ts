import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { AuthGuard } from '../common/auth.guard';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get() findAll(@Query('q') q?: string) { return this.projects.findAll(q); }
  @Get(':id') findOne(@Param('id') id: string) { return this.projects.findOne(id); }
  @Post() create(@Body() dto: CreateProjectDto) { return this.projects.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { return this.projects.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.projects.remove(id); }
}
