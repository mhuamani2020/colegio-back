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
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ConceptosService } from './conceptos.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Controller('conceptos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConceptosController {
  constructor(private readonly conceptosService: ConceptosService) {}

  @Get()
  findAll(@Query('all') all?: string) {
    const onlyActive = all !== 'true';
    return this.conceptosService.findAll(onlyActive);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.findOne(id);
  }

  @Post()
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  create(@Body() dto: CreateConceptoDto) {
    return this.conceptosService.create(dto);
  }

  @Patch(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConceptoDto,
  ) {
    return this.conceptosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.remove(id);
  }
}
