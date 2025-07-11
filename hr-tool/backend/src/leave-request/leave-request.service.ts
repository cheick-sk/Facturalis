import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';
import { LeaveRequest, LeaveRequestStatus, Prisma, Employee } from '@prisma/client';
import { LeaveBalanceService } from '../leave-balance/leave-balance.service'; // Import LeaveBalanceService

@Injectable()
export class LeaveRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaveBalanceService: LeaveBalanceService, // Inject LeaveBalanceService
    ) {}

  // Helper to calculate leave duration (excluding weekends, holidays - basic for now)
  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date.');
    }
    // Basic calculation: includes start and end date, no weekend/holiday logic yet
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
    return diffDays;
  }

  async create(createDto: CreateLeaveRequestDto, requesterId: string): Promise<LeaveRequest> {
    // In a real app, requesterId would come from auth. For now, assuming it's passed or same as employeeId.
    // Here, we assume employeeId in DTO is the one making request.
    // Add authorization check: ensure createDto.employeeId === requesterId or requester is admin/manager.
    if (createDto.employeeId !== requesterId) {
        // This check can be more sophisticated with roles/permissions
        // For now, only allow employees to request for themselves.
        // throw new ForbiddenException("You can only create leave requests for yourself.");
    }


    const { employeeId, leaveTypeId, startDate, endDate, ...restData } = createDto;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedEndDate < parsedStartDate) {
      throw new BadRequestException('End date cannot be before start date.');
    }

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

    // TODO: Validate against LeaveBalance
    // 1. Fetch LeaveBalance for employeeId, leaveTypeId, year of startDate.
    // 2. Calculate requested days.
    // 3. Check if (daysTaken + requestedDays) <= totalDaysAllowed.
    // For now, skipping this complex validation.

    const dataToCreate = {
      ...restData,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      employee: { connect: { id: employeeId } },
      leaveType: { connect: { id: leaveTypeId } },
      status: LeaveRequestStatus.PENDING, // Default status
    };

    return this.prisma.leaveRequest.create({ data: dataToCreate });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LeaveRequestWhereUniqueInput;
    where?: Prisma.LeaveRequestWhereInput; // e.g., { employeeId: '...', status: 'PENDING' }
    orderBy?: Prisma.LeaveRequestOrderByWithRelationInput;
    include?: Prisma.LeaveRequestInclude;
  }): Promise<LeaveRequest[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.leaveRequest.findMany({ skip, take, cursor, where, orderBy, include });
  }

  async findOne(id: string): Promise<LeaveRequest | null> {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true, leaveType: true, approver: true },
    });
    if (!leaveRequest) {
      throw new NotFoundException(`LeaveRequest with ID "${id}" not found.`);
    }
    return leaveRequest;
  }

  async updateStatus(id: string, updateStatusDto: UpdateLeaveRequestStatusDto, performingUserId: string): Promise<LeaveRequest> {
    const { status, comments, approverId } = updateStatusDto;

    const leaveRequest = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leaveRequest) {
      throw new NotFoundException(`LeaveRequest with ID "${id}" not found.`);
    }

    // Authorization: Check if performingUserId is allowed to approve/reject (e.g., is a manager or admin)
    // This is a placeholder for actual role-based access control (RBAC)
    const approver = await this.prisma.employee.findUnique({ where: { id: approverId }});
    if (!approver) {
        throw new NotFoundException(`Approver employee with ID "${approverId}" not found.`);
    }
    // Example: if (!approver.isManager) throw new ForbiddenException("Only managers can approve/reject requests.");


    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException(`Leave request is not PENDING and cannot be updated. Current status: ${leaveRequest.status}`);
    }

    if (status === LeaveRequestStatus.CANCELLED) {
        throw new BadRequestException("Use specific 'cancel' endpoint for employee-initiated cancellations.");
    }


    const dataToUpdate: Prisma.LeaveRequestUpdateInput = {
      status,
      comments, // Appender's comments
      approvedAt: (status === LeaveRequestStatus.APPROVED || status === LeaveRequestStatus.REJECTED) ? new Date() : null,
      approver: (status === LeaveRequestStatus.APPROVED || status === LeaveRequestStatus.REJECTED) ? { connect: { id: approverId } } : undefined,
    };

    const updatedRequest = await this.prisma.leaveRequest.update({
      where: { id },
      data: dataToUpdate,
    });

    // If APPROVED, update LeaveBalance
    if (status === LeaveRequestStatus.APPROVED) {
      const daysRequested = this.calculateLeaveDays(leaveRequest.startDate, leaveRequest.endDate);
      const yearOfLeave = leaveRequest.startDate.getFullYear();

      // If APPROVED, update LeaveBalance using LeaveBalanceService
      const daysRequested = this.calculateLeaveDays(leaveRequest.startDate, leaveRequest.endDate);
      const yearOfLeave = leaveRequest.startDate.getFullYear();
      try {
        await this.leaveBalanceService.adjustDaysTaken(
          leaveRequest.employeeId,
          leaveRequest.leaveTypeId,
          yearOfLeave,
          daysRequested, // Positive delta for deduction
        );
      } catch (balanceError) {
        console.error("Failed to update leave balance on approval:", balanceError);
        // Consider how to handle this error. Revert status? Log for admin?
        // For now, rethrow a generic error.
        throw new Error(`Leave request approved (ID: ${updatedRequest.id}), but failed to update leave balance. Please check manually.`);
      }
    }
    // TODO: Handle REJECTED (no balance change if it was PENDING, but if it was APPROVED then REJECTED, need to add days back)
    // TODO: Handle if an APPROVED request is later CANCELLED (add days back to balance)

    return updatedRequest;
  }

  async cancel(id: string, employeeId: string): Promise<LeaveRequest> {
    // employeeId is the ID of the user trying to cancel (should match leaveRequest.employeeId or be an admin)
    const leaveRequest = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leaveRequest) {
      throw new NotFoundException(`LeaveRequest with ID "${id}" not found.`);
    }

    if (leaveRequest.employeeId !== employeeId) {
      // Add admin/manager override capability here if needed
      throw new ForbiddenException("You can only cancel your own leave requests.");
    }

    if (leaveRequest.status !== LeaveRequestStatus.PENDING && leaveRequest.status !== LeaveRequestStatus.APPROVED) {
      throw new BadRequestException(`Only PENDING or APPROVED leave requests can be cancelled. Current status: ${leaveRequest.status}`);
    }

    const wasApproved = leaveRequest.status === LeaveRequestStatus.APPROVED;

    const updatedRequest = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveRequestStatus.CANCELLED },
    });

    // If a previously APPROVED request is CANCELLED, restore the days to LeaveBalance
    if (wasApproved) {
      const daysToRestore = this.calculateLeaveDays(leaveRequest.startDate, leaveRequest.endDate);
      const yearOfLeave = leaveRequest.startDate.getFullYear();
      try {
        await this.leaveBalanceService.adjustDaysTaken(
          leaveRequest.employeeId,
          leaveRequest.leaveTypeId,
          yearOfLeave,
          -daysToRestore, // Negative delta to add days back
        );
      } catch (balanceError) {
        console.error("Failed to restore leave balance on cancellation:", balanceError);
        throw new Error(`Leave request (ID: ${updatedRequest.id}) cancelled, but failed to restore leave balance. Please check manually.`);
      }
    }
    return updatedRequest;
  }

  // No generic "remove" for LeaveRequest, use cancel or specific archival logic.
  // async remove(id: string): Promise<LeaveRequest> { ... }
}
