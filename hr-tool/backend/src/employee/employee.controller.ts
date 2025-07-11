import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EmployeeEntity } from './entities/employee.entity'; // For Swagger response type

@ApiTags('employees')
@Controller('employees')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'The employee has been successfully created.', type: EmployeeEntity })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of all employees.', type: [EmployeeEntity] })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The employee data.', type: EmployeeEntity })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID (UUID)', type: String })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'The employee has been successfully updated.', type: EmployeeEntity })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'The employee has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }
}
