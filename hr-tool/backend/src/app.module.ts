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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
