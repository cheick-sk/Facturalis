import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, IsEnum, IsDateString, Matches, IsDecimal } from 'class-validator';
import { TaxType } from '@prisma/client';

export class CreateTaxRateDto {
  @ApiProperty({ example: 'Federal Income Tax - Single - Bracket 1 (2024)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'US-Federal' })
  @IsString()
  @IsNotEmpty()
  jurisdiction: string;

  @ApiProperty({ enum: TaxType, example: TaxType.INCOME_TAX })
  @IsEnum(TaxType)
  @IsNotEmpty()
  taxType: TaxType;

  @ApiProperty({ example: '0.10', description: 'Percentage rate (e.g., 0.10 for 10%). Stored as string for precision.' })
  @IsString() // Or @IsDecimal() if class-validator is configured for it
  @Matches(/^[0-9]+(\.[0-9]{1,4})?$/, { message: 'Rate must be a positive decimal string with up to 4 decimal places.'})
  @IsNotEmpty()
  rate: string; // Will be converted to Decimal in service

  @ApiProperty({ example: '0.00', description: 'Fixed amount tax, if applicable. Stored as string.', required: false })
  @IsOptional()
  @IsString() // Or @IsDecimal()
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, { message: 'Fixed amount must be a positive decimal string with up to 2 decimal places.'})
  fixedAmount?: string;

  @ApiProperty({ example: '0.00', description: 'Minimum income threshold. Stored as string.', required: false })
  @IsOptional()
  @IsString() // Or @IsDecimal()
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, { message: 'ThresholdMin must be a positive decimal string with up to 2 decimal places.'})
  thresholdMin?: string;

  @ApiProperty({ example: '10000.00', description: 'Maximum income threshold. Stored as string.', required: false })
  @IsOptional()
  @IsString() // Or @IsDecimal()
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, { message: 'ThresholdMax must be a positive decimal string with up to 2 decimal places.'})
  thresholdMax?: string;

  @ApiProperty({ example: 'Applies to income between min and max thresholds.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2024-01-01', description: 'Date this tax rate becomes active (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;

  @ApiProperty({ example: '2024-12-31', description: 'Date this tax rate ends (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
