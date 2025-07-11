import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjusted path
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from '@prisma/client'; // Prisma Employee type

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Convert date strings to Date objects if they exist
    const data: any = { ...createEmployeeDto };
    if (createEmployeeDto.dateOfBirth) {
      data.dateOfBirth = new Date(createEmployeeDto.dateOfBirth);
    }
    if (createEmployeeDto.hireDate) {
      data.hireDate = new Date(createEmployeeDto.hireDate);
    } else {
      data.hireDate = new Date(); // Default hire date if not provided
    }

    return this.prisma.employee.create({ data });
  }

  async findAll(): Promise<Employee[]> {
    return this.prisma.employee.findMany();
  }

  async findOne(id: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    // Convert date strings to Date objects if they exist
    const data: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.dateOfBirth) {
      data.dateOfBirth = new Date(updateEmployeeDto.dateOfBirth);
    }
    if (updateEmployeeDto.hireDate) {
      data.hireDate = new Date(updateEmployeeDto.hireDate);
    }

    try {
      return await this.prisma.employee.update({
        where: { id },
        data,
      });
    } catch (error) {
      // Handle Prisma error for record not found during update
      if (error.code === 'P2025') {
        throw new NotFoundException(`Employee with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Employee> {
    try {
      return await this.prisma.employee.delete({
        where: { id },
      });
    } catch (error) {
      // Handle Prisma error for record not found during delete
      if (error.code === 'P2025') {
        throw new NotFoundException(`Employee with ID "${id}" not found`);
      }
      throw error;
    }
  }
}
