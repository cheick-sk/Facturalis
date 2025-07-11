import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { Absence, Prisma } from '@prisma/client';

@Injectable()
export class AbsenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAbsenceDto): Promise<Absence> {
    const { employeeId, absenceTypeId, startDate, endDate, ...restData } = createDto;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedEndDate < parsedStartDate) {
      throw new BadRequestException('End date cannot be before start date.');
    }

    // Validate employee existence
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${employeeId}" not found.`);
    }

    // Validate absence type existence if provided
    if (absenceTypeId) {
      const absenceType = await this.prisma.absenceType.findUnique({ where: { id: absenceTypeId } });
      if (!absenceType) {
        throw new NotFoundException(`AbsenceType with ID "${absenceTypeId}" not found.`);
      }
    }

    const dataToCreate: Prisma.AbsenceCreateInput = {
      ...restData,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      employee: { connect: { id: employeeId } },
      ...(absenceTypeId && { absenceType: { connect: { id: absenceTypeId } } }),
    };

    return this.prisma.absence.create({ data: dataToCreate });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AbsenceWhereUniqueInput;
    where?: Prisma.AbsenceWhereInput; // e.g., { employeeId: '...', status: 'UNJUSTIFIED' }
    orderBy?: Prisma.AbsenceOrderByWithRelationInput;
    include?: Prisma.AbsenceInclude;
  }): Promise<Absence[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.absence.findMany({ skip, take, cursor, where, orderBy, include });
  }

  async findOne(id: string): Promise<Absence | null> {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: { employee: true, absenceType: true },
    });
    if (!absence) {
      throw new NotFoundException(`Absence with ID "${id}" not found.`);
    }
    return absence;
  }

  async update(id: string, updateDto: UpdateAbsenceDto): Promise<Absence> {
    const { startDate, endDate, absenceTypeId, ...restData } = updateDto;

    const dataToUpdate: Prisma.AbsenceUpdateInput = { ...restData };

    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (endDate) dataToUpdate.endDate = new Date(endDate);

    if (dataToUpdate.startDate && dataToUpdate.endDate && new Date(dataToUpdate.endDate) < new Date(dataToUpdate.startDate)) {
        throw new BadRequestException('End date cannot be before start date.');
    } else { // Check against existing dates if only one is provided
        const existingAbsence = await this.prisma.absence.findUnique({where: {id}});
        if (!existingAbsence) throw new NotFoundException(`Absence with ID "${id}" not found.`);
        if (dataToUpdate.startDate && !dataToUpdate.endDate && existingAbsence.endDate < new Date(dataToUpdate.startDate)) {
            throw new BadRequestException('End date cannot be before start date.');
        }
        if (!dataToUpdate.startDate && dataToUpdate.endDate && new Date(dataToUpdate.endDate) < existingAbsence.startDate) {
            throw new BadRequestException('End date cannot be before start date.');
        }
    }


    if (absenceTypeId) {
      const absenceType = await this.prisma.absenceType.findUnique({ where: { id: absenceTypeId } });
      if (!absenceType) {
        throw new NotFoundException(`AbsenceType with ID "${absenceTypeId}" not found.`);
      }
      dataToUpdate.absenceType = { connect: { id: absenceTypeId } };
    } else if (absenceTypeId === null) { // Explicitly disconnect
        dataToUpdate.absenceType = { disconnect: true };
    }

    try {
      return await this.prisma.absence.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Absence with ID "${id}" not found.`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Absence> {
    try {
      return await this.prisma.absence.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Absence with ID "${id}" not found.`);
      }
      throw error;
    }
  }
}
