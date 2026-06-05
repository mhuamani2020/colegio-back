import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass123!', description: 'Contraseña actual' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPass456!', description: 'Nueva contraseña (mín. 6 caracteres)' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
