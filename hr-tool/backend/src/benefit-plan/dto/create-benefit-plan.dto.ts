import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, IsEnum, IsDateString, IsBoolean, Matches } from 'class-validator';
import { BenefitType, PayrollCycleFrequency } from '@prisma/client';

export class CreateBenefitPlanDto {
  @ApiProperty({ example: 'Premium Health Plan PPO' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'BlueCross Shield', required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ enum: BenefitType, example: BenefitType.HEALTH_INSURANCE })
  @IsEnum(BenefitType)
  @IsNotEmpty()
  type: BenefitType;

  @ApiProperty({ example: 'Comprehensive health coverage with PPO network.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '150.00', description: 'Employee fixed contribution. Stored as string.', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, { message: 'Must be a positive decimal string with up to 2 decimal places.'})
  employeeContributionFixed?: string;

  @ApiProperty({ example: '0.02', description: 'Employee contribution as percentage of salary (e.g., 0.02 for 2%). Stored as string.', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+(\.[0-9]{1,4})?$/, { message: 'Must be a positive decimal string with up to 4 decimal places.'})
  employeeContributionPercent?: string;

  @ApiProperty({ enum: PayrollCycleFrequency, example: PayrollCycleFrequency.MONTHLY, required: false })
  @IsOptional()
  @IsEnum(PayrollCycleFrequency)
  employeeContributionFrequency?: PayrollCycleFrequency;

  @ApiProperty({ example: '300.00', description: 'Employer fixed contribution. Stored as string.', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, { message: 'Must be a positive decimal string with up to 2 decimal places.'})
  employerContributionFixed?: string;

  @ApiProperty({ example: '0.04', description: 'Employer contribution as percentage (e.g., 0.04 for 4%). Stored as string.', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+(\.[0-9]{1,4})?$/, { message: 'Must be a positive decimal string with up to 4 decimal places.'})
  employerContributionPercent?: string;

  @ApiProperty({ enum: PayrollCycleFrequency, example: PayrollCycleFrequency.MONTHLY, required: false })
  @IsOptional()
  @IsEnum(PayrollCycleFrequency)
  employerContributionFrequency?: PayrollCycleFrequency;

  @ApiProperty({ example: '0.06', description: 'Max percentage of salary employer will match for retirement plans. Stored as string.', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+(\.[0-9]{1,4})?$/, { message: 'Must be a positive decimal string with up to 4 decimal places.'})
  employerMatchLimitPercent?: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isTaxableToEmployee?: boolean = false;

  @ApiProperty({ example: 'Benefit value included in W2, Box 12, Code DD.', required: false })
  @IsOptional()
  @IsString()
  taxationDetails?: string;

  @ApiProperty({ example: 'Available to full-time employees after 90 days of service.', required: false })
  @IsOptional()
  @IsString()
  eligibilityRules?: string;

  @ApiProperty({ example: '2024-01-01', description: 'Date this benefit plan becomes active (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;

  @ApiProperty({ example: '2024-12-31', description: 'Date this benefit plan ends (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
