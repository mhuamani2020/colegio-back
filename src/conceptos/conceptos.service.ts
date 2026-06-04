import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Injectable()
export class ConceptosService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.conceptoPago.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        montoSugerido: dto.montoSugerido,
        fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
      },
    });
  }

  async update(id: number, dto: UpdateConceptoDto) {
    await this.findOne(id);
    const { fechaLimite, ...rest } = dto;
    return this.prisma.conceptoPago.update({
      where: { id },
      data: {
        ...rest,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Soft delete: desactivar en lugar de eliminar
    return this.prisma.conceptoPago.update({
      where: { id },
      data: { activo: false },
    });
  }
}
