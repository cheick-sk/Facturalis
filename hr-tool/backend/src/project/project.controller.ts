import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProjectEntity } from './entities/project.entity';

@ApiTags('projects')
@Controller('projects')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Project created successfully.', type: ProjectEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Project name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with optional filtering and pagination' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by project name (contains)'})
  @ApiQuery({ name: 'clientName', required: false, type: String, description: 'Filter by client name (contains)'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take (pagination)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of projects.', type: [ProjectEntity] })
  findAll(
    @Query('name') name?: string,
    @Query('clientName') clientName?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (clientName) where.clientName = { contains: clientName, mode: 'insensitive' };

    return this.projectService.findAll({ where, skip, take, orderBy: { name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project data.', type: ProjectEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID (UUID)', type: String })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project updated successfully.', type: ProjectEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Project name may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Project deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.remove(id);
  }
}
