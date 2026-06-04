import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAporteDto } from './dto/create-aporte.dto';

@Injectable()
export class AportesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
