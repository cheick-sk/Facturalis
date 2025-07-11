import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'HR Tool Development' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Internal Project', required: false })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ example: 'Development of the new Human Resources Management tool.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
