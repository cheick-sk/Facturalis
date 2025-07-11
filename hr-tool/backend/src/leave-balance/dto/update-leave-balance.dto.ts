import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLeaveBalanceDto } from './create-leave-balance.dto';
import { IsNumber, Min, Max, IsOptional } from 'class-validator';

// UpdateLeaveBalanceDto will allow updating totalDaysAllowed or daysTaken.
// employeeId, leaveTypeId, and year are typically not updatable as they form the composite key.
// We can use OmitType to exclude them from the PartialType if CreateLeaveBalanceDto was less restrictive.
// However, since PartialType makes all fields optional, we rely on service logic to prevent updates to key fields.

export class UpdateLeaveBalanceDto {
  @ApiProperty({
    example: 22,
    description: 'Updated total days allowed for this leave type for the year',
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(365)
  totalDaysAllowed?: number;

  @ApiProperty({
    example: 5,
    description: 'Updated days taken for this leave type for the year',
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  daysTaken?: number;
}
