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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
