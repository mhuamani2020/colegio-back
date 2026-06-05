import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'nuevo@promocion.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  apellido: string;

  @ApiProperty({ example: 6, description: 'ID del rol (1=super_admin, 2=presidente, 3=tesorero, 4=secretaria, 5=vocal, 6=padre)' })
  @IsInt()
  rolId: number;
}
