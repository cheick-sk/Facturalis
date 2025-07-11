import { ApiProperty } from '@nestjs/swagger';
import { EmployeeEntity } from '../../employee/entities/employee.entity'; // Assuming you have this
// import { ProjectEntity } from '../../project/entities/project.entity'; // If you create a Project module/entity
// import { TaskEntity } from '../../task/entities/task.entity'; // If you create a Task module/entity

export class TimesheetEntryEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: String, format: 'date' })
  date: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  startTime: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endTime: Date;

  @ApiProperty()
  duration: number; // In hours

  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;

  @ApiProperty()
  employeeId: string;
  // @ApiProperty({ type: () => EmployeeEntity }) // For nested response, if needed
  // employee?: EmployeeEntity;


  @ApiProperty({ required: false, nullable: true })
  projectId?: string | null;
  // @ApiProperty({ type: () => ProjectEntity, required: false, nullable: true })
  // project?: ProjectEntity;

  @ApiProperty({ required: false, nullable: true })
  taskId?: string | null;
  // @ApiProperty({ type: () => TaskEntity, required: false, nullable: true })
  // task?: TaskEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<TimesheetEntryEntity>) {
    Object.assign(this, partial);
  }
}
