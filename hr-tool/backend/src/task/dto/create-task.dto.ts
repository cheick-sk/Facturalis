import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement login feature' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Develop and test the user authentication flow.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'cuid_for_project', description: 'ID of the project this task belongs to' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
