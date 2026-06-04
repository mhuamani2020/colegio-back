import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ValidarAporteDto {
  @IsIn(['aprobado', 'rechazado'], {
    message: 'El estado debe ser "aprobado" o "rechazado"',
  })
  estado: 'aprobado' | 'rechazado';

  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El motivo de rechazo debe tener al menos 5 caracteres' })
  motivoRechazo?: string;
}
