import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimesheetEntryDto } from './dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from './dto/update-timesheet-entry.dto';
import { TimesheetEntry } from '@prisma/client';

@Injectable()
export class TimesheetEntryService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateDuration(startTime: Date, endTime: Date): number {
    const diffMs = endTime.getTime() - startTime.getTime();
    if (diffMs < 0) {
      throw new BadRequestException('End time must be after start time.');
    }
    const durationHours = diffMs / (1000 * 60 * 60);
    // Round to 2 decimal places (e.g., 1.25 hours for 1h 15m)
    return parseFloat(durationHours.toFixed(2));
  }

  async create(createDto: CreateTimesheetEntryDto): Promise<TimesheetEntry> {
    const { startTime, endTime, duration, employeeId, projectId, taskId, ...restData } = createDto;

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    let calculatedDuration = duration;
    if (typeof duration === 'undefined' || duration === null) {
      calculatedDuration = this.calculateDuration(parsedStartTime, parsedEndTime);
    } else if (duration <= 0) {
        throw new BadRequestException('Duration must be a positive number.');
    }

    // Validate employee existence
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${employeeId}" not found.`);
    }

    // Validate project existence if projectId is provided
    if (projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        throw new NotFoundException(`Project with ID "${projectId}" not found.`);
      }
    }

    // Validate task existence if taskId is provided
    if (taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException(`Task with ID "${taskId}" not found.`);
      }
      // Optional: Check if task belongs to the specified project
      if (projectId && task.projectId !== projectId) {
        throw new BadRequestException(`Task ID "${taskId}" does not belong to Project ID "${projectId}".`);
      }
    }


    const dataToCreate = {
      ...restData,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      duration: calculatedDuration,
      employee: { connect: { id: employeeId } },
      ...(projectId && { project: { connect: { id: projectId } } }),
      ...(taskId && { task: { connect: { id: taskId } } }),
    };

    return this.prisma.timesheetEntry.create({
      data: dataToCreate,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TimesheetEntryWhereUniqueInput; // Prisma namespace might need to be imported or use any
    where?: Prisma.TimesheetEntryWhereInput;
    orderBy?: Prisma.TimesheetEntryOrderByWithRelationInput;
  }): Promise<TimesheetEntry[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.timesheetEntry.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<TimesheetEntry | null> {
    const entry = await this.prisma.timesheetEntry.findUnique({
      where: { id },
      include: { employee: true, project: true, task: true }, // Include related data
    });
    if (!entry) {
      throw new NotFoundException(`Timesheet entry with ID "${id}" not found.`);
    }
    return entry;
  }

  async update(id: string, updateDto: UpdateTimesheetEntryDto): Promise<TimesheetEntry> {
    const { startTime, endTime, duration, projectId, taskId, ...restData } = updateDto;

    const existingEntry = await this.prisma.timesheetEntry.findUnique({ where: { id } });
    if (!existingEntry) {
      throw new NotFoundException(`Timesheet entry with ID "${id}" not found to update.`);
    }

    let newStartTime = existingEntry.startTime;
    let newEndTime = existingEntry.endTime;
    let newDuration = existingEntry.duration;

    if (startTime) newStartTime = new Date(startTime);
    if (endTime) newEndTime = new Date(endTime);

    if (duration) {
        if (duration <= 0) throw new BadRequestException('Duration must be a positive number.');
        newDuration = duration;
    } else if (startTime || endTime) { // Recalculate if start or end time changed and duration not provided
        newDuration = this.calculateDuration(newStartTime, newEndTime);
    }

    const dataToUpdate: any = { ...restData };
    if (startTime) dataToUpdate.startTime = newStartTime;
    if (endTime) dataToUpdate.endTime = newEndTime;
    dataToUpdate.duration = newDuration;


    // Validate project existence if projectId is provided
    if (projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!project) throw new NotFoundException(`Project with ID "${projectId}" not found.`);
      dataToUpdate.project = { connect: { id: projectId } };
    } else if (projectId === null) { // Explicitly disconnect project
        dataToUpdate.project = { disconnect: true };
    }


    // Validate task existence if taskId is provided
    if (taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: taskId } });
      if (!task) throw new NotFoundException(`Task with ID "${taskId}" not found.`);
      // Optional: Check if task belongs to the specified project
      const finalProjectId = projectId || existingEntry.projectId;
      if (finalProjectId && task.projectId !== finalProjectId) {
        throw new BadRequestException(`Task ID "${taskId}" does not belong to Project ID "${finalProjectId}".`);
      }
      dataToUpdate.task = { connect: { id: taskId } };
    } else if (taskId === null) { // Explicitly disconnect task
        dataToUpdate.task = { disconnect: true };
    }


    // employeeId is not updatable here. If it were, it would be:
    // if (updateDto.employeeId) {
    //   const employee = await this.prisma.employee.findUnique({ where: { id: updateDto.employeeId } });
    //   if (!employee) throw new NotFoundException(`Employee with ID "${updateDto.employeeId}" not found.`);
    //   dataToUpdate.employee = { connect: { id: updateDto.employeeId } };
    // }

    try {
      return await this.prisma.timesheetEntry.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error.code === 'P2025') { // Prisma's code for record not found on update
        throw new NotFoundException(`Timesheet entry with ID "${id}" not found during update attempt.`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<TimesheetEntry> {
    try {
      return await this.prisma.timesheetEntry.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') { // Prisma's code for record not found on delete
        throw new NotFoundException(`Timesheet entry with ID "${id}" not found.`);
      }
      throw error;
    }
  }
}

// Need to import Prisma namespace for params type in findAll
import { Prisma } from '@prisma/client';
