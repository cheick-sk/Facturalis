import { ApiProperty } from '@nestjs/swagger';

export class SalaryStructureEntity {
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

  // TODO: Add relation to SalaryStructureElementEntity if implemented
  // TODO: Add relation to EmployeeSalaryEntity

  constructor(partial: Partial<SalaryStructureEntity>) {
    Object.assign(this, partial);
  }
}
