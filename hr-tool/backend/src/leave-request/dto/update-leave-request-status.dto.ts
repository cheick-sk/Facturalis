import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { LeaveRequestStatus } from '@prisma/client'; // Assuming Prisma's enum

export class UpdateLeaveRequestStatusDto {
  @ApiProperty({
    enum: LeaveRequestStatus,
    example: LeaveRequestStatus.APPROVED,
    description: 'New status for the leave request (APPROVED, REJECTED, CANCELLED)'
  })
  @IsEnum(LeaveRequestStatus)
  @IsNotEmpty()
  status: LeaveRequestStatus;

  @ApiProperty({
    example: 'cuid_for_approver_employee',
    description: 'ID of the employee approving/rejecting (manager/admin)',
    required: true // Required when status is APPROVED or REJECTED
  })
  @IsUUID()
  @IsNotEmpty() // Should be validated conditionally based on status in service
  approverId: string;


  @ApiProperty({ example: 'Approved due to good performance.', required: false })
  @IsOptional()
  @IsString()
  comments?: string; // Comments from the approver
}
