import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAporteDto {
  @ApiProperty({ example: 1, description: 'ID del concepto de pago' })
  @Type(() => Number)
  @IsInt()
  conceptoId: number;

  @ApiProperty({ example: 150.00, description: 'Monto del aporte' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @ApiPropertyOptional({ example: 'Pago parcial de casaca', description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  descripcion?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del alumno (opcional)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  alumnoId?: number;

  @ApiProperty({
    enum: ['transferencia', 'yape', 'plin'],
    example: 'transferencia',
    description: 'Método de pago usado',
  })
  @IsString()
  @IsIn(['transferencia', 'yape', 'plin'], {
    message: 'Método de pago inválido. Use: transferencia, yape o plin',
  })
  metodoPago: string;
}
