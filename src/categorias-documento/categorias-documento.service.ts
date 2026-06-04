import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasDocumentoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoriaDocumento.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { documentos: true } } },
    });
  }

  findOne(id: number) {
    return this.prisma.categoriaDocumento.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { documentos: true } } },
    }).catch(() => {
      throw new NotFoundException(`Categoría #${id} no encontrada`);
    });
  }

  create(dto: CreateCategoriaDto) {
    return this.prisma.categoriaDocumento.create({
      data: dto,
    });
  }

  update(id: number, dto: UpdateCategoriaDto) {
    return this.findOne(id).then(() =>
      this.prisma.categoriaDocumento.update({ where: { id }, data: dto }),
    );
  }

  remove(id: number) {
    return this.findOne(id).then(() =>
      this.prisma.categoriaDocumento.delete({ where: { id } }),
    );
  }
}
