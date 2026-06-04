import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';
import { ConceptosModule } from '../conceptos/conceptos.module';
import { AportesModule } from '../aportes/aportes.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
