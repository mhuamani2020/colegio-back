import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSolicitudDto {
  @ApiProperty({ enum: ['aprobado', 'rechazado'], example: 'aprobado' })
  @IsString()
  @IsIn(['aprobado', 'rechazado'])
  estado: string;

  @ApiPropertyOptional({ example: 'El email ya está registrado', description: 'Motivo de rechazo (obligatorio si se rechaza)' })
  @IsOptional()
  @IsString()
  motivoRechazo?: string;
}
