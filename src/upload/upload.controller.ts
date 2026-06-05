import { Controller, Get, HttpCode, HttpStatus, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { SignatureQueryDto } from './dto/signature-query.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('signature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener firma Cloudinary',
    description: 'Genera una URL firmada para que el frontend suba archivos directamente a Cloudinary. No requiere auth.',
  })
  getSignature(
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    query: SignatureQueryDto,
  ) {
    return this.uploadService.generateSignature(query.folder);
  }
}
