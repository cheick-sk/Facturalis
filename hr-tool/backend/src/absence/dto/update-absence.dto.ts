import { PartialType } from '@nestjs/swagger';
import { CreateAbsenceDto } from './create-absence.dto';
import { IsOptional, IsEnum, IsDateString, IsUUID, IsString } from 'class-validator';
import { AbsenceStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';


// We use PartialType, but some fields might have specific update logic or restrictions
// employeeId is generally not updatable for an existing absence record.
export class UpdateAbsenceDto {
    @ApiProperty({ example: '2024-07-16', description: 'Updated start date (YYYY-MM-DD)', required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ example: '2024-07-16', description: 'Updated end date (YYYY-MM-DD)', required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ example: 'new_cuid_for_absence_type', required: false, description: 'Updated ID of the predefined absence type' })
    @IsOptional()
    @IsUUID()
    absenceTypeId?: string;

    @ApiProperty({ example: 'Doctor appointment, back tomorrow.', required: false, description: 'Updated reason' })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({
        enum: AbsenceStatus,
        example: AbsenceStatus.JUSTIFIED,
        description: 'Updated status of the absence',
        required: false
    })
    @IsOptional()
    @IsEnum(AbsenceStatus)
    status?: AbsenceStatus;

    @ApiProperty({ example: 'Doctor note provided.', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
