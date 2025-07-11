import { Module } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveBalanceController } from './leave-balance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LeaveTypeModule } from '../leave-type/leave-type.module'; // For validation/access to LeaveTypeService

@Module({
  imports: [
    PrismaModule,
    LeaveTypeModule, // If LeaveBalanceService needs to fetch LeaveType details (e.g., default days)
  ],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
  exports: [LeaveBalanceService], // Crucial for LeaveRequestService to use it
})
export class LeaveBalanceModule {}
