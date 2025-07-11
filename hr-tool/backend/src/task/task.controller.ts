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
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TaskEntity } from './entities/task.entity';

@ApiTags('tasks')
@Controller('tasks') // Base path for all routes in this controller
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Task created successfully.', type: TaskEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Associated Project not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Task name already exists for this project.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filtering and pagination' })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by project ID' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by task name (contains)'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take (pagination)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of tasks.', type: [TaskEntity] })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('name') name?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (name) where.name = { contains: name, mode: 'insensitive' };

    return this.taskService.findAll({ where, skip, take, orderBy: { name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task data.', type: TaskEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)', type: String })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task updated successfully.', type: TaskEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task or associated Project not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Task name may already exist for its project.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Task deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.remove(id);
  }
}
