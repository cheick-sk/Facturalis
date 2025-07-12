import { PartialType } from '@nestjs/swagger';
import { CreatePayElementDto } from './create-pay-element.dto';

export class UpdatePayElementDto extends PartialType(CreatePayElementDto) {}
