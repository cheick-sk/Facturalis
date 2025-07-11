import { Module } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { LeaveRequestController } from './leave-request.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LeaveTypeModule } from '../leave-type/leave-type.module';
import { LeaveBalanceModule } from '../leave-balance/leave-balance.module'; // Import LeaveBalanceModule

@Module({
  imports: [
    PrismaModule,
    LeaveTypeModule,
    LeaveBalanceModule, // Make LeaveBalanceService available
  ],
  controllers: [LeaveRequestController],
  providers: [LeaveRequestService],
  exports: [LeaveRequestService],
})
export class LeaveRequestModule {}
