import { IsInt, IsOptional, IsString, MinLength, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentoDto {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @Type(() => Number)
  @IsInt()
  categoriaId: number;

  @IsUrl({ protocols: ['https'] })
  url: string;

  @IsString()
  publicId: string;

  @IsOptional()
  @IsString()
  tipoMime?: string;
}
