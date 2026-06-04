import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDocumentoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
