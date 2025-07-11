import { ApiProperty } from '@nestjs/swagger';
import { AbsenceStatus } from '@prisma/client'; // Assuming Prisma's enum
// import { EmployeeEntity } from '../../employee/entities/employee.entity';
// import { AbsenceTypeEntity } from '../../absence-type/entities/absence-type.entity';

export class AbsenceEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;
  // @ApiProperty({ type: () => EmployeeEntity })
  // employee: EmployeeEntity;

  @ApiProperty({ type: String, format: 'date' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date' })
  endDate: Date;

  @ApiProperty({ required: false, nullable: true })
  absenceTypeId?: string | null;
  // @ApiProperty({ type: () => AbsenceTypeEntity, required: false, nullable: true })
  // absenceType?: AbsenceTypeEntity | null;

  @ApiProperty({ required: false, nullable: true })
  reason?: string | null;

  @ApiProperty({ enum: AbsenceStatus, enumName: 'AbsenceStatus' })
  status: AbsenceStatus;

  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<AbsenceEntity>) {
    Object.assign(this, partial);
  }
}
