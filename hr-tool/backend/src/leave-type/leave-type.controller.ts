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
import { LeaveTypeService } from './leave-type.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { LeaveTypeEntity } from './entities/leave-type.entity';

@ApiTags('leave-types')
@Controller('leave-types')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class LeaveTypeController {
  constructor(private readonly leaveTypeService: LeaveTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leave type' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Leave type created successfully.', type: LeaveTypeEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Leave type name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeaveTypeDto: CreateLeaveTypeDto) {
    return this.leaveTypeService.create(createLeaveTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave types' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by leave type name (contains)'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take (pagination)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of leave types.', type: [LeaveTypeEntity] })
  findAll(
    @Query('name') name?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    return this.leaveTypeService.findAll({ where, skip, take, orderBy: { name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a leave type by ID' })
  @ApiParam({ name: 'id', description: 'Leave Type ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave type data.', type: LeaveTypeEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave type not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a leave type by ID' })
  @ApiParam({ name: 'id', description: 'Leave Type ID (UUID)', type: String })
  @ApiBody({ type: UpdateLeaveTypeDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave type updated successfully.', type: LeaveTypeEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave type not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Leave type name may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateLeaveTypeDto: UpdateLeaveTypeDto) {
    return this.leaveTypeService.update(id, updateLeaveTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a leave type by ID' })
  @ApiParam({ name: 'id', description: 'Leave Type ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Leave type deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave type not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Leave type is in use and cannot be deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveTypeService.remove(id);
  }
}
