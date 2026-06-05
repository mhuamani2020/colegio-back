import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { QueryDocumentoDto } from './dto/query-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

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

  async create(subidoPor: number, dto: CreateDocumentoDto) {
    const doc = await this.prisma.documento.create({
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

    // Notificar a usuarios con roles que acceden documentos (todos menos padres)
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        activo: true,
        id: { not: subidoPor },
        rol: { nombre: { not: 'padre' } },
      },
      select: { id: true },
    });

    for (const u of usuarios) {
      await this.notificacionesService.log({
        usuarioId: u.id,
        titulo: '📄 Nuevo documento publicado',
        mensaje: `"${doc.titulo}" fue subido por ${doc.subidor.nombre} ${doc.subidor.apellido}.`,
        tipo: 'documento_subido',
        entidad: 'documento',
        entidadId: doc.id,
      });
    }

    await this.auditoriaService.log({
      usuarioId: subidoPor,
      accion: 'crear_documento',
      entidad: 'documento',
      entidadId: doc.id,
      detalle: { titulo: dto.titulo, categoriaId: dto.categoriaId },
    });

    return doc;
  }

  async remove(id: number, userId: number, userRol: string) {
    const doc = await this.findOne(id);
    const rolesAdmin = ['super_admin', 'presidente', 'secretaria'];

    // Solo el subidor o roles admin pueden eliminar
    if (doc.subidoPor !== userId && !rolesAdmin.includes(userRol)) {
      throw new NotFoundException(`Documento #${id} no encontrado`);
    }    await this.auditoriaService.log({
      usuarioId: userId,
      accion: 'eliminar_documento',
      entidad: 'documento',
      entidadId: id,
      detalle: { titulo: doc.titulo },
    });

    return this.prisma.documento.delete({ where: { id } });
  }}
