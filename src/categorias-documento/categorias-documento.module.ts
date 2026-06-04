import { Module } from '@nestjs/common';
import { CategoriasDocumentoController } from './categorias-documento.controller';
import { CategoriasDocumentoService } from './categorias-documento.service';

@Module({
  controllers: [CategoriasDocumentoController],
  providers: [CategoriasDocumentoService],
})
export class CategoriasDocumentoModule {}
