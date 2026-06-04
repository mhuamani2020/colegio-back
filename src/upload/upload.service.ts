import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Cloudinary credentials not fully configured. Uploads will fail until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env',
      );
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  /**
   * Genera una firma para subida directa a Cloudinary desde el frontend.
   *
   * El frontend usará estos parámetros para subir archivos directamente
   * a Cloudinary sin exponer el API Secret.
   *
   * @param folder - Carpeta opcional dentro de Cloudinary (ej: 'comprobantes', 'documentos')
   * @returns Parámetros necesarios para la subida firmada
   */
  generateSignature(folder?: string): {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
  } {
    const cloudName = this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.getOrThrow<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET');

    const timestamp = Math.floor(Date.now() / 1000);
    const uploadFolder = folder || 'general';

    // Parámetros que se firmarán (todos como string para api_sign_request)
    const paramsToSign: Record<string, string> = {
      timestamp: String(timestamp),
      folder: uploadFolder,
    };

    // Generar firma: SHA1 de los params ordenados alfabéticamente + api_secret
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret,
    );

    return {
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder: uploadFolder,
    };
  }

  /**
   * Obtiene la URL pública de un recurso en Cloudinary a partir de su publicId.
   */
  getResourceUrl(publicId: string): string {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    if (!cloudName) return '';
    return cloudinary.url(publicId, {
      cloud_name: cloudName,
      secure: true,
    });
  }
}
