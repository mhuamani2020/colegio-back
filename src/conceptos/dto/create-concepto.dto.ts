import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConceptoDto {
  @ApiProperty({ example: 'Casaca', description: 'Nombre del concepto de pago' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Cuota para la casaca de la promoción' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: 200.00, description: 'Monto sugerido de pago' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El monto sugerido debe ser mayor a 0' })
  montoSugerido?: number;

  @ApiPropertyOptional({ example: '2026-08-31', description: 'Fecha límite de pago (ISO 8601)' })
  @IsOptional()
  fechaLimite?: string;
}
