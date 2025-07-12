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
import { TaxRateService } from './tax-rate.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TaxRateEntity } from './entities/tax-rate.entity';
import { TaxType } from '@prisma/client';

@ApiTags('tax-rates')
@Controller('tax-rates')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class TaxRateController {
  constructor(private readonly taxRateService: TaxRateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tax rate' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tax rate created successfully.', type: TaxRateEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Tax rate (name, jurisdiction, effectiveDate) already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateTaxRateDto) {
    return this.taxRateService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tax rates' })
  @ApiQuery({ name: 'jurisdiction', required: false, type: String })
  @ApiQuery({ name: 'taxType', required: false, enum: TaxType })
  @ApiQuery({ name: 'effectiveDate', required: false, type: String, description: 'Filter by exact effective date (YYYY-MM-DD)'})
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of tax rates.', type: [TaxRateEntity] })
  findAll(
    @Query('jurisdiction') jurisdiction?: string,
    @Query('taxType') taxType?: TaxType,
    @Query('effectiveDate') effectiveDate?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    const where: any = {};
    if (jurisdiction) where.jurisdiction = { contains: jurisdiction, mode: 'insensitive' };
    if (taxType) where.taxType = taxType;
    if (effectiveDate) where.effectiveDate = new Date(effectiveDate);

    return this.taxRateService.findAll({ where, skip, take, orderBy: { effectiveDate: 'desc', name: 'asc' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tax rate by ID' })
  @ApiParam({ name: 'id', description: 'Tax Rate ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tax rate data.', type: TaxRateEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tax rate not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.taxRateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tax rate by ID' })
  @ApiParam({ name: 'id', description: 'Tax Rate ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tax rate updated successfully.', type: TaxRateEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tax rate not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Tax rate (name, jurisdiction, effectiveDate) may already exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateTaxRateDto) {
    return this.taxRateService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tax rate by ID' })
  @ApiParam({ name: 'id', description: 'Tax Rate ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Tax rate deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tax rate not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.taxRateService.remove(id);
  }
}
