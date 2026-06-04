import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConceptosController } from './conceptos.controller';
import { ConceptosService } from './conceptos.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConceptosController],
  providers: [ConceptosService],
  exports: [ConceptosService],
})
export class ConceptosModule {}
