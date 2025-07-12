import { ApiProperty } from '@nestjs/swagger';
import { PayrollCycleFrequency } from '@prisma/client';

export class PayrollCycleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ uniqueItems: true })
  name: string;

  @ApiProperty({ enum: PayrollCycleFrequency, enumName: 'PayrollCycleFrequency' })
  frequency: PayrollCycleFrequency;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ type: String, format: 'date' })
  effectiveDate: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<PayrollCycleEntity>) {
    Object.assign(this, partial);
  }
}
