import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCategoriaDto {
  @ApiPropertyOptional({ example: 'Actas 2026', description: 'Nuevo nombre de la categoría' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada', description: 'Nueva descripción' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

