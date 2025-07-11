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
import { AbsenceService } from './absence.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AbsenceEntity } from './entities/absence.entity';
import { AbsenceStatus } from '@prisma/client';

@ApiTags('absences')
@Controller('absences')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new absence' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Absence recorded successfully.', type: AbsenceEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Employee or AbsenceType not found.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAbsenceDto: CreateAbsenceDto) {
    return this.absenceService.create(createAbsenceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all absences with filtering and pagination' })
  @ApiQuery({ name: 'employeeId', required: false, type: String, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'absenceTypeId', required: false, type: String, description: 'Filter by absence type ID' })
  @ApiQuery({ name: 'status', required: false, enum: AbsenceStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Filter absences starting from this date (YYYY-MM-DD)'})
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Filter absences ending by this date (YYYY-MM-DD)'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of absences.', type: [AbsenceEntity] })
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('absenceTypeId') absenceTypeId?: string,
    @Query('status') status?: AbsenceStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (absenceTypeId) where.absenceTypeId = absenceTypeId;
    if (status) where.status = status;
    if (dateFrom) where.startDate = { ...where.startDate, gte: new Date(dateFrom) };
    if (dateTo) where.endDate = { ...where.endDate, lte: new Date(dateTo) };

    return this.absenceService.findAll({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
        include: { employee: {select: {id:true, firstName:true, lastName:true, email:true}}, absenceType: true }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific absence by ID' })
  @ApiParam({ name: 'id', description: 'Absence ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Absence data.', type: AbsenceEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Absence not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.absenceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an absence by ID' })
  @ApiParam({ name: 'id', description: 'Absence ID (UUID)', type: String })
  @ApiBody({ type: UpdateAbsenceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Absence updated successfully.', type: AbsenceEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Absence or related AbsenceType not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAbsenceDto: UpdateAbsenceDto) {
    return this.absenceService.update(id, updateAbsenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an absence by ID' })
  @ApiParam({ name: 'id', description: 'Absence ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Absence deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Absence not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.absenceService.remove(id);
  }
}
