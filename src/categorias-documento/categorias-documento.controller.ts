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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CategoriasDocumentoService } from './categorias-documento.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@ApiTags('Categorías de Documento')
@ApiBearerAuth('jwt-auth')
@Controller('categorias-documento')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriasDocumentoController {
  constructor(
    private readonly categoriasService: CategoriasDocumentoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías', description: 'Devuelve todas las categorías de documentos' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría', description: 'Devuelve una categoría por su ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.secretaria)
  @ApiOperation({ summary: 'Crear categoría', description: 'Crea una nueva categoría de documentos' })
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  @Patch(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.secretaria)
  @ApiOperation({ summary: 'Actualizar categoría', description: 'Actualiza una categoría existente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente)
  @ApiOperation({ summary: 'Eliminar categoría', description: 'Elimina una categoría de documentos' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
