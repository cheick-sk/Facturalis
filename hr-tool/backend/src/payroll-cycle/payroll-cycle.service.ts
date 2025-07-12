import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollCycleDto } from './dto/create-payroll-cycle.dto';
import { UpdatePayrollCycleDto } from './dto/update-payroll-cycle.dto';
import { PayrollCycle, Prisma } from '@prisma/client';

@Injectable()
export class PayrollCycleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePayrollCycleDto): Promise<PayrollCycle> {
    const { effectiveDate, ...restData } = createDto;
    try {
      return await this.prisma.payrollCycle.create({
        data: {
          ...restData,
          effectiveDate: new Date(effectiveDate),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`PayrollCycle with name "${createDto.name}" already exists.`);
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PayrollCycleWhereUniqueInput;
    where?: Prisma.PayrollCycleWhereInput;
    orderBy?: Prisma.PayrollCycleOrderByWithRelationInput;
  }): Promise<PayrollCycle[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.payrollCycle.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<PayrollCycle | null> {
    const cycle = await this.prisma.payrollCycle.findUnique({
      where: { id },
    });
    if (!cycle) {
      throw new NotFoundException(`PayrollCycle with ID "${id}" not found.`);
    }
    return cycle;
  }

  async update(id: string, updateDto: UpdatePayrollCycleDto): Promise<PayrollCycle> {
    const { effectiveDate, ...restData } = updateDto;
    const dataToUpdate: Prisma.PayrollCycleUpdateInput = { ...restData };
    if (effectiveDate) {
      dataToUpdate.effectiveDate = new Date(effectiveDate);
    }

    try {
      return await this.prisma.payrollCycle.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`PayrollCycle with ID "${id}" not found.`);
        }
        if (error.code === 'P2002' && updateDto.name) {
          throw new ConflictException(`PayrollCycle name "${updateDto.name}" may already exist.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<PayrollCycle> {
    try {
      return await this.prisma.payrollCycle.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`PayrollCycle with ID "${id}" not found.`);
      }
      // Consider P2003 if PayrollCycles are linked to other entities that restrict delete
      throw error;
    }
  }
}
