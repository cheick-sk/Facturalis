import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, Prisma } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      return await this.prisma.project.create({
        data: createProjectDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Unique constraint violation (e.g., project name already exists)
        throw new NotFoundException(`Project with name "${createProjectDto.name}" already exists.`);
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }): Promise<Project[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.project.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      // include: { tasks: true } // Optionally include related tasks
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    try {
      return await this.prisma.project.update({
        where: { id },
        data: updateProjectDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to update not found
          throw new NotFoundException(`Project with ID "${id}" not found.`);
        }
        if (error.code === 'P2002') { // Unique constraint violation on update
             throw new NotFoundException(`Project name "${updateProjectDto.name}" may already exist.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Project> {
    try {
      // Consider implications: removing a project might affect tasks and timesheet entries
      // (onDelete: Cascade for tasks, onDelete: SetNull for timesheet entries in schema)
      return await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Project with ID "${id}" not found.`);
      }
      throw error;
    }
  }
}
