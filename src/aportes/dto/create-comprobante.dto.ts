import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateComprobanteDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...', description: 'URL del comprobante en Cloudinary' })
  @IsNotEmpty({ message: 'La URL del comprobante es obligatoria' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'comprobantes/abc123', description: 'Public ID en Cloudinary' })
  @IsNotEmpty({ message: 'El publicId es obligatorio' })
  @IsString()
  @MaxLength(200)
  publicId: string;

  @ApiProperty({ example: 'image/jpeg', description: 'Tipo MIME del archivo' })
  @IsNotEmpty({ message: 'El tipo MIME es obligatorio' })
  @IsString()
  @MaxLength(50)
  tipoMime: string;
}
