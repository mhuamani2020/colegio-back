import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';
import { ConceptosModule } from '../conceptos/conceptos.module';
import { AportesModule } from '../aportes/aportes.module';
import { ReportesModule } from '../reportes/reportes.module';
import { CategoriasDocumentoModule } from '../categorias-documento/categorias-documento.module';
import { DocumentosModule } from '../documentos/documentos.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { SolicitudesModule } from '../solicitudes/solicitudes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UploadModule,
    AuthModule,
    ConceptosModule,
    AportesModule,
    ReportesModule,
    CategoriasDocumentoModule,
    DocumentosModule,
    UsuariosModule,
    AuditoriaModule,
    NotificacionesModule,
    SolicitudesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
