import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { SalaryStructure, Prisma } from '@prisma/client';

@Injectable()
export class SalaryStructureService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateSalaryStructureDto): Promise<SalaryStructure> {
    try {
      return await this.prisma.salaryStructure.create({
        data: createDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`SalaryStructure with name "${createDto.name}" already exists.`);
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SalaryStructureWhereUniqueInput;
    where?: Prisma.SalaryStructureWhereInput;
    orderBy?: Prisma.SalaryStructureOrderByWithRelationInput;
  }): Promise<SalaryStructure[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.salaryStructure.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<SalaryStructure | null> {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
      // include: { salaryStructureElements: { include: { payElement: true } } } // If elements are part of structure
    });
    if (!structure) {
      throw new NotFoundException(`SalaryStructure with ID "${id}" not found.`);
    }
    return structure;
  }

  async update(id: string, updateDto: UpdateSalaryStructureDto): Promise<SalaryStructure> {
    try {
      return await this.prisma.salaryStructure.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`SalaryStructure with ID "${id}" not found.`);
        }
        if (error.code === 'P2002' && updateDto.name) {
          throw new ConflictException(`SalaryStructure name "${updateDto.name}" may already exist.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<SalaryStructure> {
    try {
      // onDelete: SetNull for employeeSalaries.salaryStructureId
      return await this.prisma.salaryStructure.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`SalaryStructure with ID "${id}" not found.`);
      }
      // P2003 might occur if SalaryStructureElements existed and had Restrict onDelete for PayElement.
      throw error;
    }
  }
}
