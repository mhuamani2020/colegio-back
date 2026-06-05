import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AportesService } from './aportes.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { CreateComprobanteDto } from './dto/create-comprobante.dto';
import { QueryAporteDto } from './dto/query-aporte.dto';
import { ValidarAporteDto } from './dto/validar-aporte.dto';

@ApiTags('Aportes')
@ApiBearerAuth('jwt-auth')
@Controller('aportes')
@UseGuards(JwtAuthGuard)
export class AportesController {
  constructor(private readonly aportesService: AportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar aportes', description: 'Devuelve aportes filtrables. Padre ve solo los suyos, otros roles ven todos.' })
  findAll(
    @CurrentUser() user: { id: number; rol: string },
    @Query() query: QueryAporteDto,
  ) {
    return this.aportesService.findAll(user, query);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar aporte', description: 'Crea un nuevo aporte para el usuario autenticado' })
  create(
    @CurrentUser('id') usuarioId: number,
    @Body() dto: CreateAporteDto,
  ) {
    return this.aportesService.create(usuarioId, dto);
  }

  @Post(':id/comprobantes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar comprobante', description: 'Asocia un comprobante subido a Cloudinary con un aporte existente' })
  agregarComprobante(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') usuarioId: number,
    @Body() dto: CreateComprobanteDto,
  ) {
    return this.aportesService.agregarComprobante(id, usuarioId, dto);
  }

  @Patch(':id/validar')
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  @ApiOperation({ summary: 'Validar aporte', description: 'Aprueba o rechaza un aporte pendiente (Tesorero, Presidente, Super Admin)' })
  validar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') validadorId: number,
    @Body() dto: ValidarAporteDto,
  ) {
    return this.aportesService.validar(id, validadorId, dto);
  }
}
