import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async getResumen() {
    // 1. Total recaudado (aportes aprobados)
    const totalRecaudado = await this.prisma.aporte.aggregate({
      _sum: { monto: true },
      where: { estado: 'aprobado' },
    });

    // 2. Conteo por estado
    const [pendientes, aprobados, rechazados] = await Promise.all([
      this.prisma.aporte.count({ where: { estado: 'pendiente' } }),
      this.prisma.aporte.count({ where: { estado: 'aprobado' } }),
      this.prisma.aporte.count({ where: { estado: 'rechazado' } }),
    ]);

    // 3. Total aportantes distintos
    const totalAportantes = await this.prisma.aporte.groupBy({
      by: ['usuarioId'],
      _count: { id: true },
    });

    // 4. Total por concepto (solo aprobados)
    const porConcepto = await this.prisma.aporte.groupBy({
      by: ['conceptoId'],
      where: { estado: 'aprobado' },
      _sum: { monto: true },
      _count: { id: true },
    });

    // 5. Meta: sum of all active conceptos' montoSugerido * count of padres
    const [conceptosActivos, totalPadres] = await Promise.all([
      this.prisma.conceptoPago.findMany({
        where: { activo: true, montoSugerido: { not: null } },
      }),
      this.prisma.usuario.count({
        where: { rol: { nombre: 'padre' }, activo: true },
      }),
    ]);

    const metaPorAlumno = conceptosActivos.reduce(
      (sum, c) => sum + Number(c.montoSugerido ?? 0),
      0,
    );
    const totalMeta = metaPorAlumno * (totalPadres || 1);
    const recaudado = Number(totalRecaudado._sum.monto ?? 0);
    const avance = totalMeta > 0 ? Math.round((recaudado / totalMeta) * 100) : 0;

    // 6. Últimos 5 aportes
    const ultimosAportes = await this.prisma.aporte.findMany({
      take: 5,
      orderBy: { fechaAporte: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
        concepto: { select: { id: true, nombre: true } },
      },
    });

    // 7. Por concepto con nombre
    const conceptos = await this.prisma.conceptoPago.findMany({
      select: { id: true, nombre: true },
    });
    const conceptoMap = new Map(conceptos.map((c) => [c.id, c.nombre]));

    const porConceptoConNombre = porConcepto.map((item) => ({
      conceptoId: item.conceptoId,
      concepto: conceptoMap.get(item.conceptoId) ?? 'Desconocido',
      total: Number(item._sum.monto ?? 0),
      cantidad: item._count.id,
    }));

    return {
      totalRecaudado: recaudado,
      totalMeta,
      avance,
      conteoEstados: { pendientes, aprobados, rechazados },
      totalAportantes: totalAportantes.length,
      porConcepto: porConceptoConNombre,
      ultimosAportes,
    };
  }
}
