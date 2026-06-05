import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ValidarAporteDto {
  @ApiProperty({ enum: ['aprobado', 'rechazado'], example: 'aprobado', description: 'Nuevo estado del aporte' })
  @IsIn(['aprobado', 'rechazado'], {
    message: 'El estado debe ser "aprobado" o "rechazado"',
  })
  estado: 'aprobado' | 'rechazado';

  @ApiPropertyOptional({ example: 'Comprobante ilegible', description: 'Motivo del rechazo (requerido si rechazado)' })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El motivo de rechazo debe tener al menos 5 caracteres' })
  motivoRechazo?: string;
}
