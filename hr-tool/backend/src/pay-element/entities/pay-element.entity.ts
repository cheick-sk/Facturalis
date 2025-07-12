import { ApiProperty } from '@nestjs/swagger';
import { PayElementType, PayElementCalculationRule } from '@prisma/client';

export class PayElementEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ uniqueItems: true })
  name: string;

  @ApiProperty({ required: false, nullable: true, uniqueItems: true })
  code?: string | null;

  @ApiProperty({ enum: PayElementType, enumName: 'PayElementType' })
  type: PayElementType;

  @ApiProperty({ enum: PayElementCalculationRule, enumName: 'PayElementCalculationRule' })
  calculationRule: PayElementCalculationRule;

  @ApiProperty({ default: false })
  isTaxable: boolean;

  @ApiProperty({ default: false })
  isPensionable: boolean;

  @ApiProperty({ default: true })
  isRecurring: boolean;

  @ApiProperty({ default: 'USD' })
  currency: string;

  @ApiProperty({ default: 0, type: Number })
  processingOrder: number;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ type: String, format: 'date' })
  effectiveDate: Date;

  @ApiProperty({ type: String, format: 'date', required: false, nullable: true })
  endDate?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<PayElementEntity>) {
    Object.assign(this, partial);
  }
}
