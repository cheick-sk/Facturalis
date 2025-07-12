import { ApiProperty } from '@nestjs/swagger';
import { BenefitType, PayrollCycleFrequency } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class BenefitPlanEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ uniqueItems: true })
  name: string;

  @ApiProperty({ required: false, nullable: true })
  provider?: string | null;

  @ApiProperty({ enum: BenefitType, enumName: 'BenefitType' })
  type: BenefitType;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  employeeContributionFixed?: Decimal | null;

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  employeeContributionPercent?: Decimal | null;

  @ApiProperty({ enum: PayrollCycleFrequency, enumName: 'PayrollCycleFrequency', required: false, nullable: true })
  employeeContributionFrequency?: PayrollCycleFrequency | null;

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  employerContributionFixed?: Decimal | null;

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  employerContributionPercent?: Decimal | null;

  @ApiProperty({ enum: PayrollCycleFrequency, enumName: 'PayrollCycleFrequency', required: false, nullable: true })
  employerContributionFrequency?: PayrollCycleFrequency | null;

  @ApiProperty({ type: String, description: "Decimal value", required: false, nullable: true })
  employerMatchLimitPercent?: Decimal | null;

  @ApiProperty({ default: false })
  isTaxableToEmployee: boolean;

  @ApiProperty({ required: false, nullable: true })
  taxationDetails?: string | null;

  @ApiProperty({ required: false, nullable: true })
  eligibilityRules?: string | null;

  @ApiProperty({ type: String, format: 'date' })
  effectiveDate: Date;

  @ApiProperty({ type: String, format: 'date', required: false, nullable: true })
  endDate?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<BenefitPlanEntity>) {
    Object.assign(this, partial);
  }
}
