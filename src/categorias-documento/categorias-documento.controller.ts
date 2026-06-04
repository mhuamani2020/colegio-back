import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CategoriasDocumentoService } from './categorias-documento.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias-documento')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriasDocumentoController {
  constructor(
    private readonly categoriasService: CategoriasDocumentoService,
  ) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.secretaria)
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  @Patch(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.secretaria)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
