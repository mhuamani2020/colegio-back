import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';

@Controller('api/solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  crear(@Body() dto: CreateSolicitudDto) {
    return this.solicitudesService.crear(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('super_admin', 'presidente')
  findAll() {
    return this.solicitudesService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('super_admin', 'presidente')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitudDto,
    @CurrentUser('id') adminId: number,
  ) {
    if (dto.estado === 'aprobado') {
      return this.solicitudesService.aprobar(id, adminId);
    } else {
      if (!dto.motivoRechazo) {
        return { error: 'Debe indicar un motivo de rechazo' };
      }
      return this.solicitudesService.rechazar(id, adminId, dto.motivoRechazo);
    }
  }
}
