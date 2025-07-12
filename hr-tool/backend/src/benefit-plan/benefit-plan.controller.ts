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
import { BenefitPlanService } from './benefit-plan.service';
import { CreateBenefitPlanDto } from './dto/create-benefit-plan.dto';
import { UpdateBenefitPlanDto } from './dto/update-benefit-plan.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BenefitPlanEntity } from './entities/benefit-plan.entity';
import { BenefitType } from '@prisma/client';

@ApiTags('benefit-plans')
@Controller('benefit-plans')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class BenefitPlanController {
  constructor(private readonly benefitPlanService: BenefitPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new benefit plan' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Benefit plan created successfully.', type: BenefitPlanEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Benefit plan name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateBenefitPlanDto) {
    return this.benefitPlanService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all benefit plans' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name (contains)'})
  @ApiQuery({ name: 'type', required: false, enum: BenefitType, description: 'Filter by benefit type'})
  @ApiQuery({ name: 'provider', required: false, type: String, description: 'Filter by provider (contains)'})
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of benefit plans.', type: [BenefitPlanEntity] })
  findAll(
    @Query('name') name?: string,
    @Query('type') type?: BenefitType,
    @Query('provider') provider?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (type) where.type = type;
    if (provider) where.provider = { contains: provider, mode: 'insensitive' };

    return this.benefitPlanService.findAll({ where, skip, take, orderBy: { name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a benefit plan by ID' })
  @ApiParam({ name: 'id', description: 'Benefit Plan ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Benefit plan data.', type: BenefitPlanEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Benefit plan not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.benefitPlanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a benefit plan by ID' })
  @ApiParam({ name: 'id', description: 'Benefit Plan ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Benefit plan updated successfully.', type: BenefitPlanEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Benefit plan not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Benefit plan name may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateBenefitPlanDto) {
    return this.benefitPlanService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a benefit plan by ID' })
  @ApiParam({ name: 'id', description: 'Benefit Plan ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Benefit plan deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Benefit plan not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Benefit plan is in use by employee enrollments and cannot be deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.benefitPlanService.remove(id);
  }
}
