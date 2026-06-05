import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    usuarioId?: number;
    accion: string;
    entidad?: string;
    entidadId?: number;
    detalle?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    try {
      await this.prisma.auditoriaLog.create({
        data: {
          usuarioId: params.usuarioId ?? null,
          accion: params.accion,
          entidad: params.entidad ?? null,
          entidadId: params.entidadId ?? null,
          detalle: (params.detalle as Prisma.InputJsonValue) ?? undefined,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (error) {
      this.logger.error(`Error al registrar auditoría: ${error.message}`);
    }
  }

  async findAll(params: {
    usuarioId?: number;
    accion?: string;
    entidad?: string;
    desde?: string;
    hasta?: string;
  }) {
    const where: Prisma.AuditoriaLogWhereInput = {};

    if (params.usuarioId) {
      where.usuarioId = params.usuarioId;
    }

    if (params.accion) {
      where.accion = { contains: params.accion, mode: 'insensitive' };
    }

    if (params.entidad) {
      where.entidad = params.entidad;
    }

    if (params.desde || params.hasta) {
      where.createdAt = {};
      if (params.desde) (where.createdAt as any).gte = new Date(params.desde);
      if (params.hasta) (where.createdAt as any).lte = new Date(params.hasta);
    }

    return this.prisma.auditoriaLog.findMany({
      where,
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
