import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAbsenceTypeDto } from './dto/create-absence-type.dto';
import { UpdateAbsenceTypeDto } from './dto/update-absence-type.dto';
import { AbsenceType, Prisma } from '@prisma/client';

@Injectable()
export class AbsenceTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAbsenceTypeDto: CreateAbsenceTypeDto): Promise<AbsenceType> {
    try {
      return await this.prisma.absenceType.create({
        data: createAbsenceTypeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`AbsenceType with name "${createAbsenceTypeDto.name}" already exists.`);
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AbsenceTypeWhereUniqueInput;
    where?: Prisma.AbsenceTypeWhereInput;
    orderBy?: Prisma.AbsenceTypeOrderByWithRelationInput;
  }): Promise<AbsenceType[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.absenceType.findMany({ skip, take, cursor, where, orderBy });
  }

  async findOne(id: string): Promise<AbsenceType | null> {
    const absenceType = await this.prisma.absenceType.findUnique({
      where: { id },
    });
    if (!absenceType) {
      throw new NotFoundException(`AbsenceType with ID "${id}" not found.`);
    }
    return absenceType;
  }

  async update(id: string, updateAbsenceTypeDto: UpdateAbsenceTypeDto): Promise<AbsenceType> {
    try {
      return await this.prisma.absenceType.update({
        where: { id },
        data: updateAbsenceTypeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`AbsenceType with ID "${id}" not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(`AbsenceType name "${updateAbsenceTypeDto.name}" may already exist.`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<AbsenceType> {
    try {
      return await this.prisma.absenceType.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`AbsenceType with ID "${id}" not found.`);
        }
        // P2003 indicates a foreign key constraint failure (e.g., Absences are using this AbsenceType)
        // This depends on the onDelete rule in `Absence` model for `absenceTypeId`.
        // If it's SetNull (as currently defined), this error might not occur directly on AbsenceType deletion,
        // but it's good practice to be aware of it.
        if (error.code === 'P2003') {
            throw new ConflictException(`Cannot delete AbsenceType ID "${id}" as it is currently in use.`);
        }
      }
      throw error;
    }
  }
}
