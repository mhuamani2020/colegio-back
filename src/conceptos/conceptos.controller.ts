import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ConceptosService } from './conceptos.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@ApiTags('Conceptos')
@ApiBearerAuth('jwt-auth')
@Controller('conceptos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConceptosController {
  constructor(private readonly conceptosService: ConceptosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar conceptos', description: 'Devuelve todos los conceptos activos (usa ?all=true para ver inactivos)' })
  findAll(@Query('all') all?: string) {
    const onlyActive = all !== 'true';
    return this.conceptosService.findAll(onlyActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener concepto', description: 'Devuelve un concepto por su ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.findOne(id);
  }

  @Post()
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  @ApiOperation({ summary: 'Crear concepto', description: 'Crea un nuevo concepto de pago (Admin/Presidente/Tesorero)' })
  create(@Body() dto: CreateConceptoDto) {
    return this.conceptosService.create(dto);
  }

  @Patch(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  @ApiOperation({ summary: 'Actualizar concepto', description: 'Actualiza un concepto existente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConceptoDto,
  ) {
    return this.conceptosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  @ApiOperation({ summary: 'Eliminar concepto (soft-delete)', description: 'Desactiva un concepto de pago (soft-delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.remove(id);
  }
}
