import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Adjusted path

@Module({
  imports: [PrismaModule], // Import PrismaModule to make PrismaService available
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
