import { Module } from '@nestjs/common';
import { SalaryStructureService } from './salary-structure.service';
import { SalaryStructureController } from './salary-structure.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalaryStructureController],
  providers: [SalaryStructureService],
  exports: [SalaryStructureService],
})
export class SalaryStructureModule {}
