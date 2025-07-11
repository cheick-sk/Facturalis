import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { LeaveBalance, Prisma } from '@prisma/client';

@Injectable()
export class LeaveBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateLeaveBalanceDto): Promise<LeaveBalance> {
    const { employeeId, leaveTypeId, year, ...restData } = createDto;

    // Validate employee existence
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${employeeId}" not found.`);
    }

    // Validate leave type existence
    const leaveType = await this.prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
    if (!leaveType) {
      throw new NotFoundException(`LeaveType with ID "${leaveTypeId}" not found.`);
    }

    // Ensure daysTaken is not more than totalDaysAllowed
    if (restData.daysTaken && restData.totalDaysAllowed < restData.daysTaken) {
        throw new BadRequestException('Days taken cannot exceed total days allowed.');
    }

    try {
      return await this.prisma.leaveBalance.create({
        data: {
          year,
          ...restData,
          employee: { connect: { id: employeeId } },
          leaveType: { connect: { id: leaveTypeId } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Unique constraint violation (employeeId, leaveTypeId, year)
        throw new ConflictException(
          `LeaveBalance for employee ID "${employeeId}", leave type ID "${leaveTypeId}", and year "${year}" already exists.`
        );
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LeaveBalanceWhereUniqueInput;
    where?: Prisma.LeaveBalanceWhereInput; // e.g., { employeeId: '...', year: 2024 }
    orderBy?: Prisma.LeaveBalanceOrderByWithRelationInput;
    include?: Prisma.LeaveBalanceInclude;
  }): Promise<LeaveBalance[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.leaveBalance.findMany({ skip, take, cursor, where, orderBy, include });
  }

  async findOne(id: string): Promise<LeaveBalance | null> {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { id },
      include: { employee: true, leaveType: true },
    });
    if (!balance) {
      throw new NotFoundException(`LeaveBalance with ID "${id}" not found.`);
    }
    return balance;
  }

  // Find by composite key (employeeId, leaveTypeId, year)
  async findByEmployeeLeaveTypeYear(employeeId: string, leaveTypeId: string, year: number): Promise<LeaveBalance | null> {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
            employeeId,
            leaveTypeId,
            year
        }
      },
      include: { employee: true, leaveType: true },
    });
    // No NotFoundException here, as this might be used to check existence.
    return balance;
  }


  async update(id: string, updateDto: UpdateLeaveBalanceDto): Promise<LeaveBalance> {
    const existingBalance = await this.prisma.leaveBalance.findUnique({ where: { id } });
    if (!existingBalance) {
      throw new NotFoundException(`LeaveBalance with ID "${id}" not found.`);
    }

    const totalDaysAllowed = updateDto.totalDaysAllowed ?? existingBalance.totalDaysAllowed;
    const daysTaken = updateDto.daysTaken ?? existingBalance.daysTaken;

    if (daysTaken > totalDaysAllowed) {
        throw new BadRequestException('Days taken cannot exceed total days allowed.');
    }

    try {
      return await this.prisma.leaveBalance.update({
        where: { id },
        data: {
            totalDaysAllowed: updateDto.totalDaysAllowed,
            daysTaken: updateDto.daysTaken,
        },
      });
    } catch (error) {
      // P2025: Record to update not found (already handled by findUnique check)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`LeaveBalance with ID "${id}" not found during update attempt.`);
      }
      throw error;
    }
  }

  // Specific method to adjust daysTaken (e.g., when a leave request is approved/cancelled)
  // This is more robust than the direct update in LeaveRequestService
  async adjustDaysTaken(employeeId: string, leaveTypeId: string, year: number, daysDelta: number): Promise<LeaveBalance> {
    const balance = await this.findByEmployeeLeaveTypeYear(employeeId, leaveTypeId, year);
    if (!balance) {
      // Option 1: Throw error - balance should be initialized.
      // Option 2: Create a new balance record (e.g. with defaultDaysAllowed from LeaveType)
      // For now, throw error, assuming balances are pre-initialized or created on-demand elsewhere.
      throw new NotFoundException(`LeaveBalance for employee ${employeeId}, type ${leaveTypeId}, year ${year} not found.`);
    }

    const newDaysTaken = balance.daysTaken + daysDelta;
    if (newDaysTaken < 0) {
      throw new BadRequestException("Calculated days taken cannot be negative.");
    }
    if (newDaysTaken > balance.totalDaysAllowed) {
      throw new BadRequestException("Calculated days taken exceeds total days allowed for this balance.");
    }

    return this.prisma.leaveBalance.update({
      where: { id: balance.id },
      data: { daysTaken: newDaysTaken },
    });
  }


  async remove(id: string): Promise<LeaveBalance> {
    try {
      return await this.prisma.leaveBalance.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`LeaveBalance with ID "${id}" not found.`);
      }
      throw error;
    }
  }

  // TODO: Service method for initializing balances for an employee for a new year,
  // potentially based on their LeaveType's defaultDaysAllowed or other rules.
}
