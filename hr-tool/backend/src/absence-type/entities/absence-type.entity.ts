import { ApiProperty } from '@nestjs/swagger';

export class AbsenceTypeEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ uniqueItems: true })
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<AbsenceTypeEntity>) {
    Object.assign(this, partial);
  }
}
