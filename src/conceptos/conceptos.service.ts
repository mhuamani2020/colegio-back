import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Injectable()
export class ConceptosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async findAll(onlyActive = true) {
    return this.prisma.conceptoPago.findMany({
      where: onlyActive ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const concepto = await this.prisma.conceptoPago.findUnique({
      where: { id },
    });
    if (!concepto) {
      throw new NotFoundException(`Concepto #${id} no encontrado`);
    }
    return concepto;
  }

  async create(dto: CreateConceptoDto) {
    const concepto = await this.prisma.conceptoPago.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        montoSugerido: dto.montoSugerido,
        fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
      },
    });

    await this.auditoriaService.log({
      accion: 'crear_concepto',
      entidad: 'concepto_pago',
      entidadId: concepto.id,
      detalle: { nombre: dto.nombre, montoSugerido: dto.montoSugerido },
    });

    return concepto;
  }

  async update(id: number, dto: UpdateConceptoDto) {
    await this.findOne(id);
    const { fechaLimite, ...rest } = dto;
    const concepto = await this.prisma.conceptoPago.update({
      where: { id },
      data: {
        ...rest,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
      },
    });

    await this.auditoriaService.log({
      accion: 'actualizar_concepto',
      entidad: 'concepto_pago',
      entidadId: id,
      detalle: { ...dto },
    });

    return concepto;
  }

  async remove(id: number) {
    const concepto = await this.findOne(id);
    // Soft delete: desactivar en lugar de eliminar
    const result = await this.prisma.conceptoPago.update({
      where: { id },
      data: { activo: false },
    });

    await this.auditoriaService.log({
      accion: 'eliminar_concepto',
      entidad: 'concepto_pago',
      entidadId: id,
      detalle: { nombre: concepto.nombre },
    });

    return result;
  }
}
