import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { LeaveBalanceEntity } from './entities/leave-balance.entity'; // For response shaping

@ApiTags('leave-balances')
@Controller('leave-balances')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class LeaveBalanceController {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leave balance record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Leave balance created successfully.', type: LeaveBalanceEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Employee or LeaveType not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Leave balance for this employee, type, and year already exists.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeaveBalanceDto: CreateLeaveBalanceDto) {
    const balance = await this.leaveBalanceService.create(createLeaveBalanceDto);
    return new LeaveBalanceEntity(balance); // Map to entity for consistent response
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave balances with filtering' })
  @ApiQuery({ name: 'employeeId', required: false, type: String, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'leaveTypeId', required: false, type: String, description: 'Filter by leave type ID' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of leave balances.', type: [LeaveBalanceEntity] })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('year', new DefaultValuePipe(null), ParseIntPipe) year?: number | null, // Allow null if not provided
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (leaveTypeId) where.leaveTypeId = leaveTypeId;
    if (year !== null && year !== undefined) where.year = year;

    const balances = await this.leaveBalanceService.findAll({
        where,
        skip,
        take,
        orderBy: { year: 'desc' },
        include: { employee: {select: {firstName:true, lastName:true}}, leaveType: {select: {name: true}} }
    });
    return balances.map(b => new LeaveBalanceEntity(b));
  }

  @Get('employee/:employeeId/year/:year')
  @ApiOperation({ summary: 'Get all leave balances for a specific employee and year' })
  @ApiParam({ name: 'employeeId', type: String })
  @ApiParam({ name: 'year', type: Number })
  async getBalancesForEmployeeYear(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    const balances = await this.leaveBalanceService.findAll({
      where: { employeeId, year },
      include: { leaveType: true }
    });
    return balances.map(b => new LeaveBalanceEntity(b));
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a specific leave balance by its ID' })
  @ApiParam({ name: 'id', description: 'Leave Balance ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave balance data.', type: LeaveBalanceEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave balance not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const balance = await this.leaveBalanceService.findOne(id);
    return new LeaveBalanceEntity(balance);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a leave balance by ID (e.g., manual adjustment)' })
  @ApiParam({ name: 'id', description: 'Leave Balance ID (UUID)', type: String })
  @ApiBody({ type: UpdateLeaveBalanceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave balance updated successfully.', type: LeaveBalanceEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data (e.g. daysTaken > totalDaysAllowed).' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave balance not found.' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateLeaveBalanceDto: UpdateLeaveBalanceDto) {
    const balance = await this.leaveBalanceService.update(id, updateLeaveBalanceDto);
    return new LeaveBalanceEntity(balance);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a leave balance record by ID' })
  @ApiParam({ name: 'id', description: 'Leave Balance ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Leave balance deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave balance not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.leaveBalanceService.remove(id);
    // No content, so no return body needed
  }
}
