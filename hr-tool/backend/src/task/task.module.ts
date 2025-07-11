import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from '../prisma/prisma.module';
// import { ProjectModule } from '../project/project.module'; // If TaskService needs ProjectService

@Module({
  imports: [
    PrismaModule,
    // ProjectModule, // Import if TaskService needs direct access to ProjectService methods
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService], // Export if needed by other modules (e.g., TimesheetEntryService)
})
export class TaskModule {}
