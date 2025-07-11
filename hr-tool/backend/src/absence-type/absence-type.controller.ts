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
import { AbsenceTypeService } from './absence-type.service';
import { CreateAbsenceTypeDto } from './dto/create-absence-type.dto';
import { UpdateAbsenceTypeDto } from './dto/update-absence-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AbsenceTypeEntity } from './entities/absence-type.entity';

@ApiTags('absence-types')
@Controller('absence-types')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AbsenceTypeController {
  constructor(private readonly absenceTypeService: AbsenceTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new absence type' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Absence type created successfully.', type: AbsenceTypeEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Absence type name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAbsenceTypeDto: CreateAbsenceTypeDto) {
    return this.absenceTypeService.create(createAbsenceTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all absence types' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by absence type name (contains)'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take (pagination)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of absence types.', type: [AbsenceTypeEntity] })
  findAll(
    @Query('name') name?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    return this.absenceTypeService.findAll({ where, skip, take, orderBy: { name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an absence type by ID' })
  @ApiParam({ name: 'id', description: 'Absence Type ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Absence type data.', type: AbsenceTypeEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Absence type not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.absenceTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an absence type by ID' })
  @ApiParam({ name: 'id', description: 'Absence Type ID (UUID)', type: String })
  @ApiBody({ type: UpdateAbsenceTypeDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Absence type updated successfully.', type: AbsenceTypeEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Absence type not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Absence type name may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAbsenceTypeDto: UpdateAbsenceTypeDto) {
    return this.absenceTypeService.update(id, updateAbsenceTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an absence type by ID' })
  @ApiParam({ name: 'id', description: 'Absence Type ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Absence type deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Absence type not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Absence type is in use and cannot be deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.absenceTypeService.remove(id);
  }
}
