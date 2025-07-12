import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBenefitPlanDto } from './dto/create-benefit-plan.dto';
import { UpdateBenefitPlanDto } from './dto/update-benefit-plan.dto';
import { BenefitPlan, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BenefitPlanService {
  constructor(private readonly prisma: PrismaService) {}

  private convertDtoFieldsToDecimal(dto: Partial<CreateBenefitPlanDto> | Partial<UpdateBenefitPlanDto>): any {
    const data: any = { ...dto };
    // Convert string representations of Decimals from DTO to actual Decimal type for Prisma
    const decimalFields = [
      'employeeContributionFixed', 'employeeContributionPercent',
      'employerContributionFixed', 'employerContributionPercent', 'employerMatchLimitPercent'
    ];
    decimalFields.forEach(field => {
      if (dto[field] !== undefined && dto[field] !== null) {
        data[field] = new Decimal(dto[field]);
      } else if (dto.hasOwnProperty(field) && dto[field] === null) {
        data[field] = null;
      }
    });
    if (dto.effectiveDate) data.effectiveDate = new Date(dto.effectiveDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    else if (dto.hasOwnProperty('endDate') && dto.endDate === null) {
        data.endDate = null;
    }
    return data;
  }

  async create(createDto: CreateBenefitPlanDto): Promise<BenefitPlan> {
    const dataToCreate = this.convertDtoFieldsToDecimal(createDto);
    try {
      return await this.prisma.benefitPlan.create({ data: dataToCreate });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`BenefitPlan with name "${createDto.name}" already exists.`);
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BenefitPlanWhereUniqueInput;
    where?: Prisma.BenefitPlanWhereInput;
    orderBy?: Prisma.BenefitPlanOrderByWithRelationInput;
  }): Promise<BenefitPlan[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.benefitPlan.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<BenefitPlan | null> {
    const plan = await this.prisma.benefitPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`BenefitPlan with ID "${id}" not found.`);
    }
    return plan;
  }

  async update(id: string, updateDto: UpdateBenefitPlanDto): Promise<BenefitPlan> {
    const dataToUpdate = this.convertDtoFieldsToDecimal(updateDto);
    try {
      return await this.prisma.benefitPlan.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`BenefitPlan with ID "${id}" not found.`);
        }
        if (error.code === 'P2002' && updateDto.name) {
          throw new ConflictException(`BenefitPlan name "${updateDto.name}" may already exist.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<BenefitPlan> {
    try {
      // onDelete: Restrict for employeeBenefits.benefitPlanId
      return await this.prisma.benefitPlan.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`BenefitPlan with ID "${id}" not found.`);
        }
         if (error.code === 'P2003') { // Foreign key constraint failed
            throw new ConflictException(`Cannot delete BenefitPlan ID "${id}" as it is currently in use by employee benefit enrollments.`);
        }
      }
      throw error;
    }
  }
}
