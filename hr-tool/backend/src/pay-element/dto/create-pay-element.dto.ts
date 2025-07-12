import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, IsEnum, IsBoolean, IsInt, IsDateString, MaxLength } from 'class-validator';
import { PayElementType, PayElementCalculationRule } from '@prisma/client';

export class CreatePayElementDto {
  @ApiProperty({ example: 'Basic Salary' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'BASESAL', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiProperty({ enum: PayElementType, example: PayElementType.EARNING })
  @IsEnum(PayElementType)
  @IsNotEmpty()
  type: PayElementType;

  @ApiProperty({ enum: PayElementCalculationRule, example: PayElementCalculationRule.FIXED_AMOUNT })
  @IsEnum(PayElementCalculationRule)
  @IsNotEmpty()
  calculationRule: PayElementCalculationRule;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean = false;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  isPensionable?: boolean = false;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean = true;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string = 'USD';

  @ApiProperty({ example: 0, default: 0, description: 'Order of processing for calculations' })
  @IsInt()
  @IsOptional()
  processingOrder?: number = 0;

  @ApiProperty({ example: 'Monthly basic salary component.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-01-01', description: 'Date this pay element definition becomes active (YYYY-MM-DD)', required: false })
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @ApiProperty({ example: '2099-12-31', description: 'Date this pay element definition ends (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
