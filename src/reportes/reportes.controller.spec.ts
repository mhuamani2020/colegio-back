import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

describe('ReportesController', () => {
  let controller: ReportesController;
  let service: any;

  const mockResumen = {
    totalRecaudado: 1500,
    totalMeta: 3000,
    avance: 50,
    conteoEstados: { pendientes: 5, aprobados: 10, rechazados: 2 },
    totalAportantes: 8,
    porConcepto: [],
    ultimosAportes: [],
  };

  beforeEach(async () => {
    service = {
      getResumen: jest.fn().mockResolvedValue(mockResumen),
      getPorAlumno: jest.fn().mockResolvedValue([]),
      getPorConcepto: jest.fn().mockResolvedValue([]),
      exportarPorAlumnoCSV: jest.fn().mockResolvedValue('alumno,apellido\ntest,user'),
      exportarPorConceptoCSV: jest.fn().mockResolvedValue('concepto,total\ncasaca,100'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [{ provide: ReportesService, useValue: service }],
    }).compile();

    controller = module.get<ReportesController>(ReportesController);
  });

  describe('getResumen', () => {
    it('should return dashboard summary', async () => {
      const result = await controller.getResumen();
      expect(service.getResumen).toHaveBeenCalled();
      expect(result).toEqual(mockResumen);
    });
  });

  describe('getPorAlumno', () => {
    it('should return per-student report', async () => {
      const result = await controller.getPorAlumno();
      expect(service.getPorAlumno).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getPorConcepto', () => {
    it('should return per-concept report', async () => {
      const result = await controller.getPorConcepto();
      expect(service.getPorConcepto).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('export CSV endpoints', () => {
    it('should export por-alumno CSV', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
      await controller.exportarPorAlumno(mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="reporte-por-alumno.csv"',
      );
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('alumno'));
    });

    it('should export por-concepto CSV', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
      await controller.exportarPorConcepto(mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('concepto'));
    });
  });
});
