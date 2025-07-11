import { ApiProperty } from '@nestjs/swagger';
import { LeaveRequestStatus } from '@prisma/client'; // Assuming Prisma's enum
// import { EmployeeEntity } from '../../employee/entities/employee.entity';
// import { LeaveTypeEntity } from '../../leave-type/entities/leave-type.entity';

export class LeaveRequestEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;
  // @ApiProperty({ type: () => EmployeeEntity })
  // employee: EmployeeEntity;

  @ApiProperty()
  leaveTypeId: string;
  // @ApiProperty({ type: () => LeaveTypeEntity })
  // leaveType: LeaveTypeEntity;

  @ApiProperty({ type: String, format: 'date' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date' })
  endDate: Date;

  @ApiProperty({ required: false, nullable: true })
  reason?: string | null;

  @ApiProperty({ enum: LeaveRequestStatus, enumName: 'LeaveRequestStatus' })
  status: LeaveRequestStatus;

  @ApiProperty()
  requestedAt: Date;

  @ApiProperty({ required: false, nullable: true, type: String, format: 'date-time' })
  approvedAt?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  approverId?: string | null;
  // @ApiProperty({ type: () => EmployeeEntity, required: false, nullable: true })
  // approver?: EmployeeEntity | null;

  @ApiProperty({ required: false, nullable: true })
  comments?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<LeaveRequestEntity>) {
    Object.assign(this, partial);
  }
}
