import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class CreateTimesheetEntryDto {
  @ApiProperty({ example: '2023-10-26', description: 'Date of the timesheet entry (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '2023-10-26T09:00:00.000Z', description: 'Start time of the work' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2023-10-26T17:30:00.000Z', description: 'End time of the work' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 8.5, description: 'Duration of work in hours. If provided, overrides calculation from startTime and endTime.' , required: false})
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  @Max(24)
  duration?: number;

  @ApiProperty({ example: 'Worked on feature X.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'cuid_for_employee', description: 'Employee ID' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'cuid_for_project', required: false, description: 'Project ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ example: 'cuid_for_task', required: false, description: 'Task ID' })
  @IsOptional()
  @IsUUID()
  taskId?: string;
}
