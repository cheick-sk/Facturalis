import { ApiProperty } from '@nestjs/swagger';

export class LeaveTypeEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ uniqueItems: true })
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ required: false, nullable: true, type: Number, description: 'Default days allowed per year' })
  defaultDaysAllowed?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<LeaveTypeEntity>) {
    Object.assign(this, partial);
  }
}
