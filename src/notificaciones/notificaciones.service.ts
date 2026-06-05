import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificacionDto {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  entidad?: string;
  entidadId?: number;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateNotificacionDto) {
    try {
      return await this.prisma.notificacion.create({
        data: {
          usuarioId: dto.usuarioId,
          titulo: dto.titulo,
          mensaje: dto.mensaje,
          tipo: dto.tipo,
          entidad: dto.entidad ?? null,
          entidadId: dto.entidadId ?? null,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating notificación: ${error.message}`);
    }
  }

  async findAllByUser(usuarioId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async countUnread(usuarioId: number) {
    return this.prisma.notificacion.count({
      where: { usuarioId, leida: false },
    });
  }

  async markAsRead(usuarioId: number, notificacionId: number) {
    return this.prisma.notificacion.updateMany({
      where: { id: notificacionId, usuarioId },
      data: { leida: true },
    });
  }

  async markAllAsRead(usuarioId: number) {
    return this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
  }
}
