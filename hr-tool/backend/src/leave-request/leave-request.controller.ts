import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException, // For auth simulation
} from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { LeaveRequestStatus } from '@prisma/client';

// Placeholder for a decorator to get current user from request (e.g., @CurrentUser())
// For now, we'll simulate or pass it if needed, or assume service handles auth logic based on a passed ID.
const GetCurrentUserId = () => { // This is a MOCK - replace with actual auth user retrieval
    // In a real app, this would come from something like @Request() req.user.id
    // Or a custom decorator @CurrentUser() that extracts user from JWT or session
    console.warn("GetCurrentUserId is a MOCK and returns a hardcoded ID or throws error if not set for testing.");
    const MOCK_USER_ID = "cuid_placeholder_mock_user_id"; // Replace with actual test user ID if needed
    if (!MOCK_USER_ID) throw new ForbiddenException("Mock User ID not set for testing. Auth is not implemented.");
    return MOCK_USER_ID;
}


@ApiTags('leave-requests')
@Controller('leave-requests')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
// @ApiBearerAuth() // Uncomment if JWT/Bearer token authentication is implemented
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Leave request created successfully.', type: LeaveRequestEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Employee or LeaveType not found.' })
  // @ApiBody({ type: CreateLeaveRequestDto }) // Implicit from @Body()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    // Assuming createLeaveRequestDto.employeeId is the requester for now.
    // In a real system, use `GetCurrentUserId()` for the actual requester.
    const requesterId = createLeaveRequestDto.employeeId; // Or GetCurrentUserId() if employeeId field is for *whom*
    return this.leaveRequestService.create(createLeaveRequestDto, requesterId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave requests with filtering and pagination' })
  @ApiQuery({ name: 'employeeId', required: false, type: String, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'leaveTypeId', required: false, type: String, description: 'Filter by leave type ID' })
  @ApiQuery({ name: 'status', required: false, enum: LeaveRequestStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Filter requests starting from this date (YYYY-MM-DD)'})
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Filter requests ending by this date (YYYY-MM-DD)'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of leave requests.', type: [LeaveRequestEntity] })
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('status') status?: LeaveRequestStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (leaveTypeId) where.leaveTypeId = leaveTypeId;
    if (status) where.status = status;
    if (dateFrom) where.startDate = { ...where.startDate, gte: new Date(dateFrom) };
    if (dateTo) where.endDate = { ...where.endDate, lte: new Date(dateTo) }; // Or use startDate for a range query on start dates

    return this.leaveRequestService.findAll({
        where,
        skip,
        take,
        orderBy: { requestedAt: 'desc' },
        include: { employee: {select: {id:true, firstName:true, lastName:true, email:true}}, leaveType: true, approver: {select: {id:true, firstName:true, lastName:true, email:true}} }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific leave request by ID' })
  @ApiParam({ name: 'id', description: 'Leave Request ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave request data.', type: LeaveRequestEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave request not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveRequestService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of a leave request (e.g., approve, reject)' })
  @ApiParam({ name: 'id', description: 'Leave Request ID (UUID)', type: String })
  @ApiBody({ type: UpdateLeaveRequestStatusDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave request status updated successfully.', type: LeaveRequestEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or request cannot be updated.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave request or Approver not found.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeaveRequestStatusDto: UpdateLeaveRequestStatusDto,
  ) {
    // In a real system, performingUserId would come from an auth decorator like @CurrentUser()
    const performingUserId = updateLeaveRequestStatusDto.approverId; // This is the approver from the DTO
    return this.leaveRequestService.updateStatus(id, updateLeaveRequestStatusDto, performingUserId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a leave request (by employee)' })
  @ApiParam({ name: 'id', description: 'Leave Request ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave request cancelled successfully.', type: LeaveRequestEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Request cannot be cancelled.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave request not found.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'User not authorized to cancel this request.' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    // @Body() body: { employeeId: string } // Or get employeeId from authenticated user
    ) {
    // This should ideally get the employeeId from the authenticated user session/token
    const currentUserId = GetCurrentUserId(); // MOCK - Replace with actual user ID from auth
    return this.leaveRequestService.cancel(id, currentUserId);
  }
}
