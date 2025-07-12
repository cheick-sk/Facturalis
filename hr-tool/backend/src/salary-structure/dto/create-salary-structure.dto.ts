import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateSalaryStructureDto {
  @ApiProperty({ example: 'Software Engineer - Grade III' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Salary structure for senior software engineers with 5+ years experience.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  // In a more advanced version, this DTO might include an array of default pay element IDs and their values/formulas
  // for this structure, linking to a SalaryStructureElement model.
  // For now, EmployeeSalary and EmployeePayElement will handle the specific assignments.
}
