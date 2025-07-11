import { PartialType } from '@nestjs/swagger'; // Or @nestjs/mapped-types
import { CreateTimesheetEntryDto } from './create-timesheet-entry.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTimesheetEntryDto extends PartialType(CreateTimesheetEntryDto) {
  // employeeId is typically not updatable for a timesheet entry,
  // but if it were, it would be here.
  // For this DTO, we assume employeeId cannot be changed once an entry is created.
  // If you need to reassign, it's usually a delete and recreate, or a specific service method.

  // Ensure employeeId is not part of the updatable fields through PartialType if it was required in CreateDTO
  // However, if it's needed for some specific update logic where you identify the entry by something else
  // and then allow changing employeeId, you'd add it here.
  // For typical timesheet updates, employeeId is fixed.
  // We can also explicitly exclude it if it was part of CreateTimesheetEntryDto and not desired here.
  // For now, PartialType makes all fields optional. If employeeId was in CreateTimesheetEntryDto and is NOT
  // supposed to be updatable, you might need a more specific DTO or use OmitType.

  // Let's assume employeeId from CreateTimesheetEntryDto should not be updatable via this DTO.
  // We can ensure this by not re-declaring it or by using Omit if it was mandatory.
  // Since employeeId is already in CreateTimesheetEntryDto, PartialType makes it optional.
  // We will rely on the service logic to not update employeeId.
}
