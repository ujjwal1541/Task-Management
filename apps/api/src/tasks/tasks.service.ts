import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CreateTaskDto, QueryTaskDto, UpdateTaskDto } from './task.dto';

const include = {
  assignee: true,
  subtasks: { include: { assignee: true }, orderBy: { order: 'asc' } },
  _count: { select: { comments: true, subtasks: true } },
} as const;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTaskDto) {
    return this.prisma.task.findMany({
      where: {
        parentId: query.includeSubtasks ? undefined : null,
        status: query.status,
        priority: query.priority,
        projectId: query.projectId,
        ...(query.q
          ? { OR: [{ title: { contains: query.q } }, { description: { contains: query.q } }] }
          : {}),
      },
      include: include as any,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { ...(include as any), comments: { include: { author: true }, orderBy: { createdAt: 'asc' } }, project: true },
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async create(dto: CreateTaskDto) {
    return this.prisma.task.create({ data: this.toData(dto), include: include as any });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.task.update({ where: { id }, data: this.toData(dto, true), include: include as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    return { id, deleted: true };
  }

  async addComment(taskId: string, userId: string, dto: CreateCommentDto) {
    await this.findOne(taskId);
    return this.prisma.comment.create({
      data: { body: dto.body, taskId, authorId: userId },
      include: { author: true },
    });
  }

  private toData(dto: CreateTaskDto | UpdateTaskDto, partial = false) {
    const data: Record<string, unknown> = {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      reporter: dto.reporter,
      order: dto.order,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : dto.dueDate === null ? null : undefined,
      labels: dto.labels ? dto.labels.join(',') : undefined,
      assigneeId: dto.assigneeId,
      projectId: dto.projectId,
      parentId: dto.parentId,
    };
    if (partial) {
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    }
    return data as any;
  }
}
