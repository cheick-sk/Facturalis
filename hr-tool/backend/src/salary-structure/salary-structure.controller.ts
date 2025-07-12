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
import { SalaryStructureService } from './salary-structure.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SalaryStructureEntity } from './entities/salary-structure.entity';

@ApiTags('salary-structures')
@Controller('salary-structures')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class SalaryStructureController {
  constructor(private readonly salaryStructureService: SalaryStructureService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new salary structure' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Salary structure created successfully.', type: SalaryStructureEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Salary structure name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateSalaryStructureDto) {
    return this.salaryStructureService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salary structures' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name (contains)'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of salary structures.', type: [SalaryStructureEntity] })
  findAll(
    @Query('name') name?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    return this.salaryStructureService.findAll({ where, skip, take, orderBy: { name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a salary structure by ID' })
  @ApiParam({ name: 'id', description: 'Salary Structure ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Salary structure data.', type: SalaryStructureEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Salary structure not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salaryStructureService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a salary structure by ID' })
  @ApiParam({ name: 'id', description: 'Salary Structure ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Salary structure updated successfully.', type: SalaryStructureEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Salary structure not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Salary structure name may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateSalaryStructureDto) {
    return this.salaryStructureService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a salary structure by ID' })
  @ApiParam({ name: 'id', description: 'Salary Structure ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Salary structure deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Salary structure not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.salaryStructureService.remove(id);
  }
}
