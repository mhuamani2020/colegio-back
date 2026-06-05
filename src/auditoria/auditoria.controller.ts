import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolNombre } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditoriaService } from './auditoria.service';

@ApiTags('Auditoría')
@ApiBearerAuth('jwt-auth')
@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolNombre.super_admin, RolNombre.presidente)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoría', description: 'Devuelve los logs de actividad filtrables (solo Super Admin/Presidente)' })
  @ApiQuery({ name: 'usuarioId', required: false, example: 1, description: 'Filtrar por ID de usuario' })
  @ApiQuery({ name: 'accion', required: false, example: 'login', description: 'Filtrar por tipo de acción' })
  @ApiQuery({ name: 'entidad', required: false, example: 'aporte', description: 'Filtrar por entidad' })
  @ApiQuery({ name: 'desde', required: false, example: '2026-01-01', description: 'Fecha desde (ISO 8601)' })
  @ApiQuery({ name: 'hasta', required: false, example: '2026-12-31', description: 'Fecha hasta (ISO 8601)' })
  findAll(
    @Query('usuarioId') usuarioId?: string,
    @Query('accion') accion?: string,
    @Query('entidad') entidad?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.auditoriaService.findAll({
      usuarioId: usuarioId ? Number(usuarioId) : undefined,
      accion,
      entidad,
      desde,
      hasta,
    });
  }
}
