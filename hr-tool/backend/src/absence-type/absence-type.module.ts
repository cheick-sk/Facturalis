import { Module } from '@nestjs/common';
import { AbsenceTypeService } from './absence-type.service';
import { AbsenceTypeController } from './absence-type.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AbsenceTypeController],
  providers: [AbsenceTypeService],
  exports: [AbsenceTypeService], // Export if needed by AbsenceService
})
export class AbsenceTypeModule {}
