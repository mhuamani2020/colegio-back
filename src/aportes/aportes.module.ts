import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { AportesController } from './aportes.controller';
import { AportesService } from './aportes.service';

@Module({
  imports: [PrismaModule, AuditoriaModule, NotificacionesModule],
  controllers: [AportesController],
  providers: [AportesService],
  exports: [AportesService],
})
export class AportesModule {}
