import { IsOptional, IsString, Matches } from 'class-validator';

export class SignatureQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'folder must contain only letters, numbers, hyphens, and underscores',
  })
  folder?: string;
}
