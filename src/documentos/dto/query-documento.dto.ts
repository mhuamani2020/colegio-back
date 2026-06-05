import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDocumentoDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por ID de categoría' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @ApiPropertyOptional({ example: 'acta', description: 'Búsqueda por título' })
  @IsOptional()
  @IsString()
  search?: string;
}
