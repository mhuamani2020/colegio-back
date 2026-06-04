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
} from '@nestjs/common';
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AportesService } from './aportes.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { QueryAporteDto } from './dto/query-aporte.dto';
import { ValidarAporteDto } from './dto/validar-aporte.dto';

@Controller('aportes')
@UseGuards(JwtAuthGuard)
export class AportesController {
  constructor(private readonly aportesService: AportesService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: number; rol: string },
    @Query() query: QueryAporteDto,
  ) {
    return this.aportesService.findAll(user, query);
  }

  @Post()
  create(
    @CurrentUser('id') usuarioId: number,
    @Body() dto: CreateAporteDto,
  ) {
    return this.aportesService.create(usuarioId, dto);
  }

  @Patch(':id/validar')
  @UseGuards(RolesGuard)
  @Roles(RolNombre.super_admin, RolNombre.presidente, RolNombre.tesorero)
  validar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') validadorId: number,
    @Body() dto: ValidarAporteDto,
  ) {
    return this.aportesService.validar(id, validadorId, dto);
  }
}
