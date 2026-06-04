import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsInt()
  rolId: number;
}
