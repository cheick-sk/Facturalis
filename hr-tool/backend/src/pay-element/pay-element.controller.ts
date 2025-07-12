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
import { PayElementService } from './pay-element.service';
import { CreatePayElementDto } from './dto/create-pay-element.dto';
import { UpdatePayElementDto } from './dto/update-pay-element.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PayElementEntity } from './entities/pay-element.entity';
import { PayElementType, PayElementCalculationRule } from '@prisma/client';

@ApiTags('pay-elements')
@Controller('pay-elements')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PayElementController {
  constructor(private readonly payElementService: PayElementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pay element' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pay element created successfully.', type: PayElementEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Pay element name or code already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePayElementDto) {
    return this.payElementService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pay elements' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name (contains)'})
  @ApiQuery({ name: 'code', required: false, type: String, description: 'Filter by code'})
  @ApiQuery({ name: 'type', required: false, enum: PayElementType, description: 'Filter by type'})
  @ApiQuery({ name: 'calculationRule', required: false, enum: PayElementCalculationRule, description: 'Filter by calculation rule'})
  @ApiQuery({ name: 'isRecurring', required: false, type: Boolean, description: 'Filter by recurring status'})
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of pay elements.', type: [PayElementEntity] })
  findAll(
    @Query('name') name?: string,
    @Query('code') code?: string,
    @Query('type') type?: PayElementType,
    @Query('calculationRule') calculationRule?: PayElementCalculationRule,
    @Query('isRecurring', new DefaultValuePipe(undefined)) isRecurring?: boolean, // ParseBoolPipe might be needed if strict
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (code) where.code = code;
    if (type) where.type = type;
    if (calculationRule) where.calculationRule = calculationRule;
    if (isRecurring !== undefined) where.isRecurring = isRecurring;

    return this.payElementService.findAll({ where, skip, take, orderBy: { processingOrder: 'asc', name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pay element by ID' })
  @ApiParam({ name: 'id', description: 'Pay Element ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pay element data.', type: PayElementEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pay element not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.payElementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pay element by ID' })
  @ApiParam({ name: 'id', description: 'Pay Element ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pay element updated successfully.', type: PayElementEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pay element not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Pay element name or code may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdatePayElementDto) {
    return this.payElementService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pay element by ID' })
  @ApiParam({ name: 'id', description: 'Pay Element ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Pay element deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pay element not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Pay element is in use and cannot be deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.payElementService.remove(id);
  }
}
