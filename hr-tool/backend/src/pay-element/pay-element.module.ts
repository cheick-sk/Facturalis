import { Module } from '@nestjs/common';
import { PayElementService } from './pay-element.service';
import { PayElementController } from './pay-element.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayElementController],
  providers: [PayElementService],
  exports: [PayElementService],
})
export class PayElementModule {}
