import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAporteDto {
  @ApiPropertyOptional({ enum: ['pendiente', 'aprobado', 'rechazado'], example: 'pendiente' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  conceptoId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuarioId?: number;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Fecha desde (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Fecha hasta (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}
