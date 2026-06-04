import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { QueryDocumentoDto } from './dto/query-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: QueryDocumentoDto) {
    const where: any = {};

    if (query.categoriaId) {
      where.categoriaId = query.categoriaId;
    }

    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.documento.findMany({
      where,
      include: {
        categoria: { select: { id: true, nombre: true } },
        subidor: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { fechaDocumento: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.documento
      .findUniqueOrThrow({
        where: { id },
        include: {
          categoria: { select: { id: true, nombre: true } },
          subidor: { select: { id: true, nombre: true, apellido: true } },
        },
      })
      .catch(() => {
        throw new NotFoundException(`Documento #${id} no encontrado`);
      });
  }

  create(subidoPor: number, dto: CreateDocumentoDto) {
    return this.prisma.documento.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        categoriaId: dto.categoriaId,
        url: dto.url,
        publicId: dto.publicId,
        tipoMime: dto.tipoMime ?? 'application/pdf',
        subidoPor,
      },
      include: {
        categoria: { select: { id: true, nombre: true } },
        subidor: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  async remove(id: number, userId: number, userRol: string) {
    const doc = await this.findOne(id);
    const rolesAdmin = ['super_admin', 'presidente', 'secretaria'];

    // Solo el subidor o roles admin pueden eliminar
    if (doc.subidoPor !== userId && !rolesAdmin.includes(userRol)) {
      throw new NotFoundException(`Documento #${id} no encontrado`);
    }

    return this.prisma.documento.delete({ where: { id } });
  }
}
