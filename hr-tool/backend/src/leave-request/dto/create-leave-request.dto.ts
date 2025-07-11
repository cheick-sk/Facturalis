import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID, MinLength } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'cuid_for_employee', description: 'ID of the employee making the request' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'cuid_for_leave_type', description: 'ID of the leave type' })
  @IsUUID()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({ example: '2024-07-01', description: 'Start date of the leave (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-07-05', description: 'End date of the leave (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'Family vacation', required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  reason?: string;

  @ApiProperty({ example: 'Additional comments from the employee.', required: false })
  @IsOptional()
  @IsString()
  comments?: string;
}
