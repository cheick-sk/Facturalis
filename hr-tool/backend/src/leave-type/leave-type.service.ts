import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveType, Prisma } from '@prisma/client';

@Injectable()
export class LeaveTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveTypeDto: CreateLeaveTypeDto): Promise<LeaveType> {
    try {
      return await this.prisma.leaveType.create({
        data: createLeaveTypeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`LeaveType with name "${createLeaveTypeDto.name}" already exists.`);
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LeaveTypeWhereUniqueInput;
    where?: Prisma.LeaveTypeWhereInput;
    orderBy?: Prisma.LeaveTypeOrderByWithRelationInput;
  }): Promise<LeaveType[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.leaveType.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<LeaveType | null> {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
    });
    if (!leaveType) {
      throw new NotFoundException(`LeaveType with ID "${id}" not found.`);
    }
    return leaveType;
  }

  async update(id: string, updateLeaveTypeDto: UpdateLeaveTypeDto): Promise<LeaveType> {
    try {
      return await this.prisma.leaveType.update({
        where: { id },
        data: updateLeaveTypeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`LeaveType with ID "${id}" not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(`LeaveType name "${updateLeaveTypeDto.name}" may already exist.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<LeaveType> {
    // Note: onDelete: Restrict on LeaveRequest for leaveTypeId will prevent deletion if used.
    try {
      return await this.prisma.leaveType.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to delete not found
          throw new NotFoundException(`LeaveType with ID "${id}" not found.`);
        }
        if (error.code === 'P2003') { // Foreign key constraint failed (e.g., LeaveRequests or LeaveBalances are using this LeaveType)
            throw new ConflictException(`Cannot delete LeaveType ID "${id}" as it is currently in use by leave requests or balances.`);
        }
      }
      throw error;
    }
  }
}
