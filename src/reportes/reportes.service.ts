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

  async getPorAlumno() {
    // Obtener todos los alumnos que tienen al menos un aporte (o todos)
    const alumnos = await this.prisma.alumno.findMany({
      include: {
        padre: { select: { id: true, nombre: true, apellido: true } },
        aportes: {
          select: {
            id: true,
            monto: true,
            estado: true,
            fechaAporte: true,
            conceptoId: true,
          },
          orderBy: { fechaAporte: 'desc' },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    // Conceptos para monto sugerido
    const conceptos = await this.prisma.conceptoPago.findMany({
      where: { activo: true, montoSugerido: { not: null } },
    });
    const metaPorAlumno = conceptos.reduce(
      (sum, c) => sum + Number(c.montoSugerido ?? 0),
      0,
    );

    return alumnos.map((alumno) => {
      const aportesAprobados = alumno.aportes.filter(
        (a) => a.estado === 'aprobado',
      );
      const totalAportado = aportesAprobados.reduce(
        (sum, a) => sum + Number(a.monto),
        0,
      );
      const ultimoAporte = alumno.aportes[0] ?? null;
      const cantidadAportes = alumno.aportes.length;
      const avance =
        metaPorAlumno > 0
          ? Math.round((totalAportado / metaPorAlumno) * 100)
          : 0;

      return {
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        grado: alumno.grado,
        seccion: alumno.seccion,
        apoderado: alumno.padre
          ? `${alumno.padre.nombre} ${alumno.padre.apellido}`
          : null,
        totalAportado,
        cantidadAportes,
        cantidadAprobados: aportesAprobados.length,
        avance,
        ultimoAporte: ultimoAporte
          ? {
              monto: Number(ultimoAporte.monto),
              estado: ultimoAporte.estado,
              fechaAporte: ultimoAporte.fechaAporte,
            }
          : null,
      };
    });
  }

  async getPorConcepto() {
    const [conceptos, totalPadres] = await Promise.all([
      this.prisma.conceptoPago.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.usuario.count({
        where: { rol: { nombre: 'padre' }, activo: true },
      }),
    ]);

    // Aportes aprobados agrupados por concepto
    const aportesPorConcepto = await this.prisma.aporte.groupBy({
      by: ['conceptoId'],
      where: { estado: 'aprobado' },
      _sum: { monto: true },
      _count: { id: true },
    });

    // Aportantes distintos por concepto
    const aportantesPorConcepto = await this.prisma.aporte.groupBy({
      by: ['conceptoId', 'usuarioId'],
      where: { estado: 'aprobado' },
    });

    // Contar usuarios únicos por concepto
    const aportantesCountMap = new Map<number, number>();
    for (const item of aportantesPorConcepto) {
      const current = aportantesCountMap.get(item.conceptoId) ?? 0;
      aportantesCountMap.set(item.conceptoId, current + 1);
    }

    const aporteMap = new Map(
      aportesPorConcepto.map((item) => [item.conceptoId, item]),
    );

    const totalRecaudadoGeneral = aportesPorConcepto.reduce(
      (sum, item) => sum + Number(item._sum.monto ?? 0),
      0,
    );

    return conceptos.map((concepto) => {
      const data = aporteMap.get(concepto.id);
      const recaudado = Number(data?._sum.monto ?? 0);
      const cantidad = data?._count.id ?? 0;
      const aportantes = aportantesCountMap.get(concepto.id) ?? 0;
      const montoSugerido = Number(concepto.montoSugerido ?? 0);
      const metaConcepto = montoSugerido * (totalPadres || 1);
      const avance =
        metaConcepto > 0
          ? Math.round((recaudado / metaConcepto) * 100)
          : 0;

      return {
        conceptoId: concepto.id,
        concepto: concepto.nombre,
        descripcion: concepto.descripcion,
        montoSugerido,
        totalRecaudado: recaudado,
        cantidadAportes: cantidad,
        cantidadAportantes: aportantes,
        metaTotal: metaConcepto,
        avance,
      };
    });
  }
}
