import { ApiProperty } from '@nestjs/swagger';
import { TaxType } from '@prisma/client'; // Assuming Prisma's enum
import { Decimal } from '@prisma/client/runtime/library'; // For Decimal type

export class TaxRateEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  jurisdiction: string;

  @ApiProperty({ enum: TaxType, enumName: 'TaxType' })
  taxType: TaxType;

  @ApiProperty({ type: String, description: "Decimal value stored as string for precision" }) // Swagger limitation
  rate: Decimal; // Prisma uses Decimal, ensure it's handled correctly (e.g. string in DTOs)

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  fixedAmount?: Decimal | null;

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  thresholdMin?: Decimal | null;

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  thresholdMax?: Decimal | null;

  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;

  @ApiProperty({ type: String, format: 'date' })
  effectiveDate: Date;

  @ApiProperty({ type: String, format: 'date', required: false, nullable: true })
  endDate?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<TaxRateEntity>) {
    Object.assign(this, partial);
  }
}
