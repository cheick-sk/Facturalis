import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// projectId is typically not updatable directly.
// If a task needs to move to another project, it might be a delete & recreate,
// or a special service method. For now, UpdateTaskDto will not include projectId.
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    // Exclude projectId from being updatable via this DTO by not re-declaring or by using OmitType if needed.
    // Since projectId is in CreateTaskDto, PartialType makes it optional.
    // We will rely on service logic to not update projectId if that's the desired behavior.
    // If projectId *can* be updated, it would be:
    // @IsOptional()
    // @IsUUID()
    // @ApiProperty({ example: 'new_cuid_for_project', required: false })
    // projectId?: string;
}
