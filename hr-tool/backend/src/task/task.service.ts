import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, Prisma } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { projectId, name, ...restData } = createTaskDto;

    // Validate project existence
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }

    try {
      return await this.prisma.task.create({
        data: {
          ...restData,
          name,
          project: { connect: { id: projectId } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Unique constraint violation (e.g., task name for this project already exists)
        throw new BadRequestException(`Task with name "${name}" already exists for project ID "${projectId}".`);
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput; // e.g., { projectId: 'some-project-id' }
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.task.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true }, // Optionally include related project
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found.`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const { name, projectId, ...restData } = updateTaskDto;

    // If projectId is part of UpdateTaskDto and needs to be updated:
    // if (projectId) {
    //   const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    //   if (!project) {
    //     throw new NotFoundException(`Project with ID "${projectId}" not found for task update.`);
    //   }
    // }
    // For now, assuming projectId is not updatable or handled by specific logic if it is.

    try {
      const dataToUpdate: any = { ...restData };
      if (name) dataToUpdate.name = name;
      // if (projectId) dataToUpdate.project = { connect: { id: projectId } };


      return await this.prisma.task.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to update not found
          throw new NotFoundException(`Task with ID "${id}" not found.`);
        }
        if (error.code === 'P2002') { // Unique constraint violation
          // This might be complex if name is only unique *within* a project
          // The current schema has @@unique([name, projectId])
          // So, if name changes, we need to ensure it's unique for its current project.
          // If projectId also changes, the check is against the new project.
          // For simplicity, this basic error is shown.
          throw new BadRequestException(`Task name "${name}" may already exist for its project.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Task> {
    try {
      // Consider implications: removing a task might affect timesheet entries
      // (onDelete: SetNull for timesheet entries in schema)
      return await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Task with ID "${id}" not found.`);
      }
      throw error;
    }
  }
}
