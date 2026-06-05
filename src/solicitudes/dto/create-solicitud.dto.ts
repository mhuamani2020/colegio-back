import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSolicitudDto {
  @ApiProperty({ example: 'Juan', description: 'Nombres del solicitante' })
  @IsString()
  @MinLength(2)
  nombres: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellidos del solicitante' })
  @IsString()
  @MinLength(2)
  apellidos: string;

  @ApiProperty({ example: 'padre@ejemplo.com', description: 'Correo electrónico' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '999888777', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Luis Pérez', description: 'Nombre del alumno (si aplica)' })
  @IsOptional()
  @IsString()
  alumnoNombre?: string;

  @ApiPropertyOptional({ example: '5to', description: 'Grado del alumno' })
  @IsOptional()
  @IsString()
  alumnoGrado?: string;

  @ApiPropertyOptional({ example: 'A', description: 'Sección del alumno' })
  @IsOptional()
  @IsString()
  alumnoSeccion?: string;
}
