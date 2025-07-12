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
import { PayrollCycleService } from './payroll-cycle.service';
import { CreatePayrollCycleDto } from './dto/create-payroll-cycle.dto';
import { UpdatePayrollCycleDto } from './dto/update-payroll-cycle.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PayrollCycleEntity } from './entities/payroll-cycle.entity';

@ApiTags('payroll-cycles')
@Controller('payroll-cycles')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PayrollCycleController {
  constructor(private readonly payrollCycleService: PayrollCycleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payroll cycle' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Payroll cycle created successfully.', type: PayrollCycleEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Payroll cycle name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePayrollCycleDto) {
    return this.payrollCycleService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payroll cycles' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name (contains)'})
  @ApiQuery({ name: 'frequency', required: false, type: String, description: 'Filter by frequency'}) // Consider enum type for Swagger
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of payroll cycles.', type: [PayrollCycleEntity] })
  findAll(
    @Query('name') name?: string,
    @Query('frequency') frequency?: string, // PrismaClient.PayrollCycleFrequency, but query param is string
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (frequency) where.frequency = frequency; // Prisma will validate enum value
    return this.payrollCycleService.findAll({ where, skip, take, orderBy: { name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payroll cycle by ID' })
  @ApiParam({ name: 'id', description: 'Payroll Cycle ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payroll cycle data.', type: PayrollCycleEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payroll cycle not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollCycleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payroll cycle by ID' })
  @ApiParam({ name: 'id', description: 'Payroll Cycle ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payroll cycle updated successfully.', type: PayrollCycleEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payroll cycle not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Payroll cycle name may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdatePayrollCycleDto) {
    return this.payrollCycleService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payroll cycle by ID' })
  @ApiParam({ name: 'id', description: 'Payroll Cycle ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Payroll cycle deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payroll cycle not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollCycleService.remove(id);
  }
}
