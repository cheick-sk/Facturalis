import { ApiProperty } from '@nestjs/swagger';
// import { ProjectEntity } from '../../project/entities/project.entity';

export class TaskEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  projectId: string;
  // @ApiProperty({ type: () => ProjectEntity }) // For nested response
  // project?: ProjectEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // TODO: Add relation to TimesheetEntryEntity if needed for response shaping

  constructor(partial: Partial<TaskEntity>) {
    Object.assign(this, partial);
  }
}
