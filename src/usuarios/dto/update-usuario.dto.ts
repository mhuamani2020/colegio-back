import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @ApiPropertyOptional({ example: '999888777' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 3, description: 'ID del nuevo rol' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rolId?: number;

  @ApiPropertyOptional({ example: true, description: 'Activar/desactivar usuario' })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
