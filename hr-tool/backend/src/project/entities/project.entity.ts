import { ApiProperty } from '@nestjs/swagger';

export class ProjectEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ uniqueItems: true })
  name: string;

  @ApiProperty({ required: false, nullable: true })
  clientName?: string | null;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // TODO: Add relations to TaskEntity and TimesheetEntryEntity if needed for response shaping
  // @ApiProperty({ type: () => [TaskEntity], required: false })
  // tasks?: TaskEntity[];

  constructor(partial: Partial<ProjectEntity>) {
    Object.assign(this, partial);
  }
}
