import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, IsEnum, IsDateString } from 'class-validator';
import { PayrollCycleFrequency } from '@prisma/client';

export class CreatePayrollCycleDto {
  @ApiProperty({ example: 'Monthly Salaried Employees' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ enum: PayrollCycleFrequency, example: PayrollCycleFrequency.MONTHLY })
  @IsEnum(PayrollCycleFrequency)
  @IsNotEmpty()
  frequency: PayrollCycleFrequency;

  @ApiProperty({ example: 'Standard monthly pay cycle for all salaried staff.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-01-01', description: 'Date this cycle definition becomes active (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;
}
