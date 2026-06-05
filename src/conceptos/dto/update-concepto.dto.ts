import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateConceptoDto {
  @ApiPropertyOptional({ example: 'Casaca 2026' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: 250.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  montoSugerido?: number;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  fechaLimite?: string;

  @ApiPropertyOptional({ example: true, description: 'Activar/desactivar concepto' })
  @IsOptional()
  activo?: boolean;
}
