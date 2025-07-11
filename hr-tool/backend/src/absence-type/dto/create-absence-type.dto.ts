import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateAbsenceTypeDto {
  @ApiProperty({ example: 'Uncertified Sick Leave' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Short-term illness without a doctor\'s certificate.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
