import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayElementDto } from './dto/create-pay-element.dto';
import { UpdatePayElementDto } from './dto/update-pay-element.dto';
import { PayElement, Prisma } from '@prisma/client';

@Injectable()
export class PayElementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePayElementDto): Promise<PayElement> {
    const { effectiveDate, endDate, ...restData } = createDto;
    const dataToCreate: Prisma.PayElementCreateInput = {
        ...restData,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        ...(endDate && { endDate: new Date(endDate) }),
     };

    try {
      return await this.prisma.payElement.create({
        data: dataToCreate,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // This can be for 'name' or 'code' if they are unique
        const target = error.meta?.target as string[];
        if (target?.includes('name')) {
            throw new ConflictException(`PayElement with name "${createDto.name}" already exists.`);
        }
        if (target?.includes('code') && createDto.code) {
            throw new ConflictException(`PayElement with code "${createDto.code}" already exists.`);
        }
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PayElementWhereUniqueInput;
    where?: Prisma.PayElementWhereInput;
    orderBy?: Prisma.PayElementOrderByWithRelationInput;
  }): Promise<PayElement[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.payElement.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<PayElement | null> {
    const element = await this.prisma.payElement.findUnique({
      where: { id },
    });
    if (!element) {
      throw new NotFoundException(`PayElement with ID "${id}" not found.`);
    }
    return element;
  }

  async update(id: string, updateDto: UpdatePayElementDto): Promise<PayElement> {
    const { effectiveDate, endDate, ...restData } = updateDto;
    const dataToUpdate: Prisma.PayElementUpdateInput = { ...restData };
    if (effectiveDate) dataToUpdate.effectiveDate = new Date(effectiveDate);
    if (endDate) dataToUpdate.endDate = new Date(endDate);
    else if (updateDto.hasOwnProperty('endDate') && endDate === null) { // Explicitly set to null
        dataToUpdate.endDate = null;
    }


    try {
      return await this.prisma.payElement.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`PayElement with ID "${id}" not found.`);
        }
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[];
          if (target?.includes('name') && updateDto.name) {
            throw new ConflictException(`PayElement name "${updateDto.name}" may already exist.`);
          }
          if (target?.includes('code') && updateDto.code) {
            throw new ConflictException(`PayElement code "${updateDto.code}" may already exist.`);
          }
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<PayElement> {
    try {
      // onDelete: Restrict for employeePayElements.payElementId
      return await this.prisma.payElement.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`PayElement with ID "${id}" not found.`);
        }
        if (error.code === 'P2003') { // Foreign key constraint failed
            throw new ConflictException(`Cannot delete PayElement ID "${id}" as it is currently in use by employee salary configurations.`);
        }
      }
      throw error;
    }
  }
}
