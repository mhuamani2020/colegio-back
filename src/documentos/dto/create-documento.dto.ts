import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentoDto {
  @ApiProperty({ example: 'Acta Reunión 2026', description: 'Título del documento' })
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiPropertyOptional({ example: 'Acta de la reunión del comité del 15/03/2026', description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 1, description: 'ID de la categoría del documento' })
  @Type(() => Number)
  @IsInt()
  categoriaId: number;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', description: 'URL del documento en Cloudinary' })
  @IsUrl({ protocols: ['https'] })
  url: string;

  @ApiProperty({ example: 'documentos/abc123', description: 'Public ID en Cloudinary' })
  @IsString()
  publicId: string;

  @ApiPropertyOptional({ example: 'application/pdf', description: 'Tipo MIME del archivo' })
  @IsOptional()
  @IsString()
  tipoMime?: string;
}
