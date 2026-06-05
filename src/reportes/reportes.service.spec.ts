import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportesService', () => {
  let service: ReportesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      aporte: {
        aggregate: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      conceptoPago: {
        findMany: jest.fn(),
      },
      usuario: {
        count: jest.fn(),
      },
      alumno: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
  });

  describe('getResumen', () => {
    it('should return dashboard summary', async () => {
      prisma.aporte.aggregate.mockResolvedValue({ _sum: { monto: 1500 } });
      prisma.aporte.count.mockResolvedValueOnce(5); // pendientes
      prisma.aporte.count.mockResolvedValueOnce(10); // aprobados
      prisma.aporte.count.mockResolvedValueOnce(2); // rechazados
      // First groupBy: totalAportantes
      prisma.aporte.groupBy.mockResolvedValueOnce([
        { usuarioId: 1, _count: { id: 1 } },
        { usuarioId: 2, _count: { id: 1 } },
      ]);
      // Second groupBy: porConcepto (with _sum)
      prisma.aporte.groupBy.mockResolvedValueOnce([
        { conceptoId: 1, _sum: { monto: 800 }, _count: { id: 4 } },
      ]);
      prisma.conceptoPago.findMany.mockResolvedValue([
        { id: 1, nombre: 'Casaca', montoSugerido: 200 },
        { id: 2, nombre: 'Anuario', montoSugerido: 100 },
      ]);
      prisma.usuario.count.mockResolvedValue(10);
      prisma.aporte.findMany.mockResolvedValue([]);

      const result = await service.getResumen();

      expect(result).toHaveProperty('totalRecaudado', 1500);
      expect(result).toHaveProperty('totalMeta');
      expect(result).toHaveProperty('avance');
      expect(result).toHaveProperty('conteoEstados');
      expect(result.conteoEstados).toEqual({ pendientes: 5, aprobados: 10, rechazados: 2 });
      expect(result).toHaveProperty('totalAportantes', 2);
      expect(result).toHaveProperty('porConcepto');
      expect(result).toHaveProperty('ultimosAportes');
      // Verify porConcepto data
      expect(result.porConcepto).toHaveLength(1);
      expect(result.porConcepto[0].total).toBe(800);
      expect(result.porConcepto[0].cantidad).toBe(4);
    });
  });

  describe('getPorAlumno', () => {
    it('should return per-student report', async () => {
      prisma.alumno.findMany.mockResolvedValue([
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          grado: '5to',
          seccion: 'A',
          padre: { id: 1, nombre: 'Carlos', apellido: 'Pérez' },
          aportes: [
            { id: 1, monto: 100, estado: 'aprobado', fechaAporte: new Date(), conceptoId: 1 },
            { id: 2, monto: 50, estado: 'pendiente', fechaAporte: new Date(), conceptoId: 2 },
          ],
        },
      ]);
      prisma.conceptoPago.findMany.mockResolvedValue([
        { id: 1, nombre: 'Casaca', montoSugerido: 200 },
      ]);

      const result = await service.getPorAlumno();

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Juan');
      expect(result[0].totalAportado).toBe(100);
      expect(result[0].cantidadAportes).toBe(2);
      expect(result[0].cantidadAprobados).toBe(1);
    });
  });

  describe('getPorConcepto', () => {
    it('should return per-concept report', async () => {
      prisma.conceptoPago.findMany.mockResolvedValue([
        { id: 1, nombre: 'Casaca', descripcion: null, montoSugerido: 200 },
      ]);
      prisma.usuario.count.mockResolvedValue(10);
      // First groupBy: aportesPorConcepto
      prisma.aporte.groupBy.mockResolvedValueOnce([
        { conceptoId: 1, _sum: { monto: 800 }, _count: { id: 4 } },
      ]);
      // Second groupBy: aportantesPorConcepto
      prisma.aporte.groupBy.mockResolvedValueOnce([
        { conceptoId: 1, usuarioId: 1 },
        { conceptoId: 1, usuarioId: 2 },
        { conceptoId: 1, usuarioId: 3 },
      ]);

      const result = await service.getPorConcepto();

      expect(result).toHaveLength(1);
      expect(result[0].concepto).toBe('Casaca');
      expect(result[0].totalRecaudado).toBe(800);
      expect(result[0].cantidadAportes).toBe(4);
      expect(result[0].cantidadAportantes).toBe(3);
      expect(result[0].montoSugerido).toBe(200);
    });
  });

  describe('export CSV', () => {
    it('should generate CSV for por-alumno', async () => {
      prisma.alumno.findMany.mockResolvedValue([]);
      prisma.conceptoPago.findMany.mockResolvedValue([]);

      const csv = await service.exportarPorAlumnoCSV();

      expect(csv).toContain('Alumno');
      expect(csv).toContain('Avance %');
    });

    it('should generate CSV for por-concepto', async () => {
      prisma.conceptoPago.findMany.mockResolvedValue([]);
      prisma.usuario.count.mockResolvedValue(0);
      prisma.aporte.groupBy.mockResolvedValueOnce([]);
      prisma.aporte.groupBy.mockResolvedValueOnce([]);

      const csv = await service.exportarPorConceptoCSV();

      expect(csv).toContain('Concepto');
      expect(csv).toContain('Avance %');
    });
  });

  describe('escapeCSV', () => {
    it('should escape values with commas', () => {
      const escaped = (service as any).escapeCSV('Hello, World');
      expect(escaped).toBe('"Hello, World"');
    });

    it('should escape values with quotes', () => {
      const escaped = (service as any).escapeCSV('Hello "World"');
      expect(escaped).toBe('"Hello ""World"""');
    });

    it('should not escape simple values', () => {
      const escaped = (service as any).escapeCSV('Simple');
      expect(escaped).toBe('Simple');
    });
  });
});
