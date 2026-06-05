import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { CreateComprobanteDto } from './dto/create-comprobante.dto';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

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
    const aporte = await this.prisma.aporte.create({
      data: {
        usuarioId,
        conceptoId: dto.conceptoId,
        monto: dto.monto,
        descripcion: dto.descripcion,
        alumnoId: dto.alumnoId,
        metodoPago: dto.metodoPago as any,
      },
      include: {
        concepto: true,
        alumno: true,
      },
    });

    await this.auditoriaService.log({
      usuarioId,
      accion: 'crear_aporte',
      entidad: 'aporte',
      entidadId: aporte.id,
      detalle: { monto: dto.monto, conceptoId: dto.conceptoId, metodoPago: dto.metodoPago },
    });

    return aporte;
  }

  async agregarComprobante(
    aporteId: number,
    usuarioId: number,
    dto: CreateComprobanteDto,
  ) {
    const aporte = await this.prisma.aporte.findUnique({
      where: { id: aporteId },
    });

    if (!aporte) {
      throw new NotFoundException(`Aporte #${aporteId} no encontrado`);
    }

    // Only the owner can add comprobantes to their own aportes
    if (aporte.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes agregar comprobantes a un aporte de otro usuario');
    }

    return this.prisma.comprobante.create({
      data: {
        aporteId,
        url: dto.url,
        publicId: dto.publicId,
        tipoMime: dto.tipoMime,
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

    const result = await this.prisma.aporte.update({
      where: { id },
      data: {
        estado: dto.estado,
        motivoRechazo: dto.motivoRechazo,
        validadoPor: validadorId,
        validadoEn: new Date(),
      },
      include: APORTE_INCLUDE,
    });

    await this.auditoriaService.log({
      usuarioId: validadorId,
      accion: dto.estado === 'aprobado' ? 'aprobar_aporte' : 'rechazar_aporte',
      entidad: 'aporte',
      entidadId: id,
      detalle: { estado: dto.estado, motivoRechazo: dto.motivoRechazo },
    });

    // Notificar al padre dueño del aporte
    if (aporte.usuarioId !== validadorId) {
      const titulo = dto.estado === 'aprobado'
        ? 'Aporte aprobado ✅'
        : 'Aporte rechazado ❌';
      const mensaje = dto.estado === 'aprobado'
        ? `Tu aporte de S/ ${result.monto} ha sido aprobado.`
        : `Tu aporte de S/ ${result.monto} fue rechazado.${dto.motivoRechazo ? ` Motivo: ${dto.motivoRechazo}` : ''}`;

      await this.notificacionesService.log({
        usuarioId: aporte.usuarioId,
        titulo,
        mensaje,
        tipo: dto.estado === 'aprobado' ? 'aporte_aprobado' : 'aporte_rechazado',
        entidad: 'aporte',
        entidadId: id,
      });
    }

    return result;
  }
}
