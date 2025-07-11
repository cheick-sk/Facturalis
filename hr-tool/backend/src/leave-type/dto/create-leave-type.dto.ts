import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, IsNumber, Min, Max } from 'class-validator';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'Annual Leave' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Paid time off for vacation.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 20, required: false, description: 'Default number of days allowed annually for this leave type.' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 }) // Allow for half days e.g. 0.5
  @Min(0)
  @Max(365) // Reasonable upper limit
  defaultDaysAllowed?: number;
}
