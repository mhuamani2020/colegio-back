import { Controller, Get, HttpCode, HttpStatus, Query, ValidationPipe } from '@nestjs/common';
import { UploadService } from './upload.service';
import { SignatureQueryDto } from './dto/signature-query.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Obtiene una firma firmada para subir archivos directamente a Cloudinary.
   *
   * El frontend debe usar estos parámetros para hacer un POST directo
   * a la API de Cloudinary. Nunca se expone el API Secret al cliente.
   *
   * @param folder - Carpeta destino (comprobantes, documentos, general)
   * @returns Parámetros de subida firmados
   */
  @Get('signature')
  @HttpCode(HttpStatus.OK)
  getSignature(
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    query: SignatureQueryDto,
  ) {
    return this.uploadService.generateSignature(query.folder);
  }
}
