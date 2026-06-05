import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificacionesService } from './notificaciones.service';

interface AuthRequest extends Request {
  user: { id: number; email: string; rol: string };
}

@ApiTags('Notificaciones')
@ApiBearerAuth('jwt-auth')
@Controller('api/notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones', description: 'Devuelve todas las notificaciones del usuario autenticado' })
  findAll(@Request() req: AuthRequest) {
    return this.notificacionesService.findAllByUser(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar no leídas', description: 'Devuelve la cantidad de notificaciones no leídas del usuario' })
  countUnread(@Request() req: AuthRequest) {
    return this.notificacionesService.countUnread(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar como leída', description: 'Marca una notificación como leída' })
  markAsRead(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.notificacionesService.markAsRead(req.user.id, Number(id));
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todo como leído', description: 'Marca todas las notificaciones del usuario como leídas' })
  markAllAsRead(@Request() req: AuthRequest) {
    return this.notificacionesService.markAllAsRead(req.user.id);
  }
}
