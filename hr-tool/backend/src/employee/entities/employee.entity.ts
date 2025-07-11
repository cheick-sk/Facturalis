import { ApiProperty } from '@nestjs/swagger';

export class EmployeeEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ uniqueItems: true })
  email: string;

  @ApiProperty({ required: false, nullable: true })
  phoneNumber?: string | null;

  @ApiProperty({ type: String, format: 'date-time', required: false, nullable: true })
  dateOfBirth?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  hireDate: Date;

  @ApiProperty({ required: false, nullable: true })
  jobTitle?: string | null;

  @ApiProperty({ required: false, nullable: true })
  department?: string | null;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<EmployeeEntity>) {
    Object.assign(this, partial);
  }
}
