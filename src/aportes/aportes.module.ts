import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AportesController } from './aportes.controller';
import { AportesService } from './aportes.service';

@Module({
  imports: [PrismaModule],
  controllers: [AportesController],
  providers: [AportesService],
  exports: [AportesService],
})
export class AportesModule {}
