import { Module } from '@nestjs/common';
import { PayrollCycleService } from './payroll-cycle.service';
import { PayrollCycleController } from './payroll-cycle.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollCycleController],
  providers: [PayrollCycleService],
  exports: [PayrollCycleService],
})
export class PayrollCycleModule {}
