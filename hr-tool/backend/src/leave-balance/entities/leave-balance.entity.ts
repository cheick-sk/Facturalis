import { ApiProperty } from '@nestjs/swagger';
// import { EmployeeEntity } from '../../employee/entities/employee.entity';
// import { LeaveTypeEntity } from '../../leave-type/entities/leave-type.entity';

export class LeaveBalanceEntity {
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

  @ApiProperty({ example: 2024, type: Number })
  year: number;

  @ApiProperty({ type: Number })
  totalDaysAllowed: number;

  @ApiProperty({ type: Number, default: 0 })
  daysTaken: number;

  @ApiProperty({ type: Number, description: "Calculated as totalDaysAllowed - daysTaken" })
  daysRemaining: number; // This will be a calculated property in the service/response

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<LeaveBalanceEntity>) {
    Object.assign(this, partial);
    if (partial.totalDaysAllowed !== undefined && partial.daysTaken !== undefined) {
        this.daysRemaining = partial.totalDaysAllowed - partial.daysTaken;
    } else {
        this.daysRemaining = partial.totalDaysAllowed || 0;
    }
  }
}
