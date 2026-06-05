import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @ApiProperty({ example: '999888777' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}
