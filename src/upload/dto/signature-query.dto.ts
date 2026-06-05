import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class SignatureQueryDto {
  @ApiPropertyOptional({ example: 'comprobantes', description: 'Carpeta destino en Cloudinary (comprobantes, documentos, general)' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'folder must contain only letters, numbers, hyphens, and underscores',
  })
  folder?: string;
}
