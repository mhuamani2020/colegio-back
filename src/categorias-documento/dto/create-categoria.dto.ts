import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Actas', description: 'Nombre de la categoría' })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiPropertyOptional({ example: 'Actas de reuniones del comité', description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
