import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID, IsEnum } from 'class-validator';
import { AbsenceStatus } from '@prisma/client';

export class CreateAbsenceDto {
  @ApiProperty({ example: 'cuid_for_employee', description: 'ID of the employee' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: '2024-07-15', description: 'Start date of the absence (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-07-15', description: 'End date of the absence (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'cuid_for_absence_type', required: false, description: 'ID of the predefined absence type' })
  @IsOptional()
  @IsUUID()
  absenceTypeId?: string;

  @ApiProperty({ example: 'Feeling unwell.', required: false, description: 'Free text reason if no type or for additional details' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    enum: AbsenceStatus,
    example: AbsenceStatus.REPORTED,
    description: 'Initial status of the absence',
    required: false,
    default: AbsenceStatus.REPORTED
  })
  @IsOptional()
  @IsEnum(AbsenceStatus)
  status?: AbsenceStatus = AbsenceStatus.REPORTED;

  @ApiProperty({ example: 'Called in sick at 8 AM.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
