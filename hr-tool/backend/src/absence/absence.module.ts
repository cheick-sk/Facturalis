import { Module } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AbsenceTypeModule } from '../absence-type/absence-type.module'; // For validation/access to AbsenceTypeService

@Module({
  imports: [
    PrismaModule,
    AbsenceTypeModule, // Make AbsenceTypeService available if needed
  ],
  controllers: [AbsenceController],
  providers: [AbsenceService],
  exports: [AbsenceService],
})
export class AbsenceModule {}
