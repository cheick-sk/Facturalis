import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { PrismaModule } from './prisma/prisma.module'; // To be created
import { ConfigModule } from '@nestjs/config'; // For environment variables

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes .env variables available globally
    }),
    PrismaModule,    // Module for Prisma service
    EmployeeModule,  // Our Employee module
    TimesheetEntryModule, // Our new TimesheetEntry module
    ProjectModule, // Our new Project module
    TaskModule, // Our new Task module
    LeaveTypeModule, // Our new LeaveType module
    LeaveRequestModule, // Our new LeaveRequest module
    LeaveBalanceModule, // Our new LeaveBalance module
    AbsenceTypeModule, // Our new AbsenceType module
    AbsenceModule, // Our new Absence module
    PayrollCycleModule, // Payroll config module
    SalaryStructureModule, // Payroll config module
    PayElementModule, // Payroll config module
    TaxRateModule, // Payroll config module
    // TODO: Add BenefitPlan module
    // TODO: Add employee payroll modules (EmployeeSalary, EmployeeBenefit)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
