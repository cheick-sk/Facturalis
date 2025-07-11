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
import { TimesheetEntryService } from './timesheet-entry.service';
import { CreateTimesheetEntryDto } from './dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from './dto/update-timesheet-entry.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TimesheetEntryEntity } from './entities/timesheet-entry.entity';

@ApiTags('timesheet-entries')
@Controller('timesheet-entries') // Base path for all routes in this controller
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class TimesheetEntryController {
  constructor(private readonly timesheetEntryService: TimesheetEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new timesheet entry' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Timesheet entry created successfully.', type: TimesheetEntryEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Related entity (Employee, Project, Task) not found.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTimesheetEntryDto: CreateTimesheetEntryDto) {
    return this.timesheetEntryService.create(createTimesheetEntryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all timesheet entries with optional filtering and pagination' })
  @ApiQuery({ name: 'employeeId', required: false, type: String, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by project ID' })
  @ApiQuery({ name: 'taskId', required: false, type: String, description: 'Filter by task ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Filter by date from (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Filter by date to (YYYY-MM-DD)' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take (pagination)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of timesheet entries.', type: [TimesheetEntryEntity] })
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number, // Default to 100, adjust as needed
  ) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    // Consider adding orderBy, e.g., orderBy: { date: 'desc' }
    return this.timesheetEntryService.findAll({ where, skip, take, orderBy: { date: 'desc', startTime: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific timesheet entry by ID' })
  @ApiParam({ name: 'id', description: 'Timesheet Entry ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Timesheet entry data.', type: TimesheetEntryEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timesheet entry not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a timesheet entry by ID' })
  @ApiParam({ name: 'id', description: 'Timesheet Entry ID (UUID)', type: String })
  @ApiBody({ type: UpdateTimesheetEntryDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Timesheet entry updated successfully.', type: TimesheetEntryEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timesheet entry or related entity not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTimesheetEntryDto: UpdateTimesheetEntryDto) {
    return this.timesheetEntryService.update(id, updateTimesheetEntryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timesheet entry by ID' })
  @ApiParam({ name: 'id', description: 'Timesheet Entry ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Timesheet entry deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timesheet entry not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.remove(id);
  }
}
