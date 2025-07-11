import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsInt, Min, Max, IsNumber } from 'class-validator';

export class CreateLeaveBalanceDto {
  @ApiProperty({ example: 'cuid_for_employee', description: 'ID of the employee' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'cuid_for_leave_type', description: 'ID of the leave type' })
  @IsUUID()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({ example: 2024, description: 'The year this balance applies to' })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 20, description: 'Total days allowed for this leave type for the year' })
  @IsNumber({ maxDecimalPlaces: 1 }) // Allow for half days e.g. 0.5
  @Min(0)
  @Max(365) // A reasonable upper limit for a single leave type balance
  totalDaysAllowed: number;

  @ApiProperty({ example: 0, description: 'Days already taken (usually starts at 0)', required: false, default: 0 })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @IsOptional()
  daysTaken?: number = 0;
}
