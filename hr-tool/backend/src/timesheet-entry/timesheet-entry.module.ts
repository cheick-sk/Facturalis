import { Module } from '@nestjs/common';
import { TimesheetEntryService } from './timesheet-entry.service';
import { TimesheetEntryController } from './timesheet-entry.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimesheetEntryController],
  providers: [TimesheetEntryService],
  exports: [TimesheetEntryService]
})
export class TimesheetEntryModule {}
