import { PartialType } from '@nestjs/swagger'; // Or @nestjs/mapped-types
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
