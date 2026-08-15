import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(q?: string) {
    return this.prisma.project.findMany({
      where: q ? { name: { contains: q } } : undefined,
      include: { lead: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { lead: true, tasks: { where: { parentId: null }, include: { assignee: true } } },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : null },
      include: { lead: true, _count: { select: { tasks: true } } },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
      include: { lead: true, _count: { select: { tasks: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
    return { id, deleted: true };
  }
}
