import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { QueryAporteDto } from './dto/query-aporte.dto';
import { ValidarAporteDto } from './dto/validar-aporte.dto';

const APORTE_INCLUDE = {
  concepto: { select: { id: true, nombre: true, montoSugerido: true } },
  alumno: { select: { id: true, nombre: true, apellido: true } },
  usuario: { select: { id: true, nombre: true, apellido: true } },
  comprobantes: {
    select: { id: true, url: true, tipoMime: true, createdAt: true },
  },
} satisfies Prisma.AporteInclude;

@Injectable()
export class AportesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    user: { id: number; rol: string },
    query: QueryAporteDto,
  ) {
    const rolesConAccesoTotal = ['super_admin', 'presidente', 'tesorero', 'secretaria', 'vocal'];
    const tieneAccesoTotal = rolesConAccesoTotal.includes(user.rol);

    const where: Prisma.AporteWhereInput = {};

    // Segregación: padres ven solo sus aportes
    if (!tieneAccesoTotal) {
      where.usuarioId = user.id;
    } else if (query.usuarioId) {
      where.usuarioId = query.usuarioId;
    }

    if (query.estado) {
      where.estado = query.estado as any;
    }

    if (query.conceptoId) {
      where.conceptoId = query.conceptoId;
    }

    if (query.desde || query.hasta) {
      where.fechaAporte = {};
      if (query.desde) where.fechaAporte.gte = new Date(query.desde);
      if (query.hasta) where.fechaAporte.lte = new Date(query.hasta);
    }

    return this.prisma.aporte.findMany({
      where,
      include: APORTE_INCLUDE,
      orderBy: { fechaAporte: 'desc' },
    });
  }

  async create(usuarioId: number, dto: CreateAporteDto) {
    return this.prisma.aporte.create({
      data: {
        usuarioId,
        conceptoId: dto.conceptoId,
        monto: dto.monto,
        descripcion: dto.descripcion,
        alumnoId: dto.alumnoId,
      },
      include: {
        concepto: true,
        alumno: true,
      },
    });
  }

  async validar(
    id: number,
    validadorId: number,
    dto: ValidarAporteDto,
  ) {
    const aporte = await this.prisma.aporte.findUnique({
      where: { id },
    });

    if (!aporte) {
      throw new NotFoundException(`Aporte #${id} no encontrado`);
    }

    if (aporte.estado !== 'pendiente') {
      throw new BadRequestException(
        `El aporte ya fue ${aporte.estado === 'aprobado' ? 'aprobado' : 'rechazado'} anteriormente`,
      );
    }

    if (dto.estado === 'rechazado' && !dto.motivoRechazo) {
      throw new BadRequestException('Debe indicar el motivo de rechazo');
    }

    return this.prisma.aporte.update({
      where: { id },
      data: {
        estado: dto.estado,
        motivoRechazo: dto.motivoRechazo,
        validadoPor: validadorId,
        validadoEn: new Date(),
      },
      include: APORTE_INCLUDE,
    });
  }
}
