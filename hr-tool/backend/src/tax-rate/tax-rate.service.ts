import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { TaxRate, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TaxRateService {
  constructor(private readonly prisma: PrismaService) {}

  private convertDtoFieldsToDecimal(dto: Partial<CreateTaxRateDto> | Partial<UpdateTaxRateDto>): any {
    const data: any = { ...dto };
    if (dto.rate) data.rate = new Decimal(dto.rate);
    if (dto.fixedAmount) data.fixedAmount = new Decimal(dto.fixedAmount);
    if (dto.thresholdMin) data.thresholdMin = new Decimal(dto.thresholdMin);
    if (dto.thresholdMax) data.thresholdMax = new Decimal(dto.thresholdMax);
    if (dto.effectiveDate) data.effectiveDate = new Date(dto.effectiveDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    else if (dto.hasOwnProperty('endDate') && dto.endDate === null) {
        data.endDate = null;
    }
    return data;
  }

  async create(createDto: CreateTaxRateDto): Promise<TaxRate> {
    const dataToCreate = this.convertDtoFieldsToDecimal(createDto);
     if (dataToCreate.thresholdMax && dataToCreate.thresholdMin && dataToCreate.thresholdMax < dataToCreate.thresholdMin) {
        throw new BadRequestException('ThresholdMax cannot be less than ThresholdMin.');
    }
    try {
      return await this.prisma.taxRate.create({ data: dataToCreate });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Based on @@unique([name, jurisdiction, effectiveDate])
        throw new ConflictException(
          `TaxRate with name "${createDto.name}", jurisdiction "${createDto.jurisdiction}", and effective date "${createDto.effectiveDate}" already exists.`
        );
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaxRateWhereUniqueInput;
    where?: Prisma.TaxRateWhereInput;
    orderBy?: Prisma.TaxRateOrderByWithRelationInput;
  }): Promise<TaxRate[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.taxRate.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<TaxRate | null> {
    const rate = await this.prisma.taxRate.findUnique({
      where: { id },
    });
    if (!rate) {
      throw new NotFoundException(`TaxRate with ID "${id}" not found.`);
    }
    return rate;
  }

  async update(id: string, updateDto: UpdateTaxRateDto): Promise<TaxRate> {
    const dataToUpdate = this.convertDtoFieldsToDecimal(updateDto);

    // Validate thresholds if both are being updated or one is updated against an existing one
    const existingRate = await this.prisma.taxRate.findUnique({ where: { id }});
    if (!existingRate) {
        throw new NotFoundException(`TaxRate with ID "${id}" not found.`);
    }
    const newMin = dataToUpdate.thresholdMin ?? existingRate.thresholdMin;
    const newMax = dataToUpdate.thresholdMax ?? existingRate.thresholdMax;
    if (newMin !== null && newMax !== null && newMax < newMin) {
         throw new BadRequestException('ThresholdMax cannot be less than ThresholdMin.');
    }

    try {
      return await this.prisma.taxRate.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`TaxRate with ID "${id}" not found.`);
        }
        if (error.code === 'P2002') {
          // Potentially complex if unique fields are updated
          throw new ConflictException('Update violates unique constraint for TaxRate. Check name, jurisdiction, and effectiveDate combination.');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<TaxRate> {
    try {
      return await this.prisma.taxRate.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`TaxRate with ID "${id}" not found.`);
      }
      // P2003 might occur if TaxRates are linked to other models that restrict delete
      throw error;
    }
  }
}
