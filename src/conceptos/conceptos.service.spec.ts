import { Test, TestingModule } from '@nestjs/testing';
import { ConceptosService } from './conceptos.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('ConceptosService', () => {
  let service: ConceptosService;
  let prisma: any;
  let auditoriaService: any;

  const mockConcepto = {
    id: 1,
    nombre: 'Casaca',
    descripcion: 'Cuota para la casaca',
    montoSugerido: 200,
    fechaLimite: new Date('2026-08-31'),
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      conceptoPago: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    auditoriaService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConceptosService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditoriaService, useValue: auditoriaService },
      ],
    }).compile();

    service = module.get<ConceptosService>(ConceptosService);
  });

  describe('findAll', () => {
    it('should return only active conceptos by default', async () => {
      prisma.conceptoPago.findMany.mockResolvedValue([mockConcepto]);

      const result = await service.findAll();

      expect(result).toEqual([mockConcepto]);
      expect(prisma.conceptoPago.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should return all conceptos when onlyActive is false', async () => {
      prisma.conceptoPago.findMany.mockResolvedValue([mockConcepto]);

      await service.findAll(false);

      expect(prisma.conceptoPago.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { nombre: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a concepto by id', async () => {
      prisma.conceptoPago.findUnique.mockResolvedValue(mockConcepto);

      const result = await service.findOne(1);
      expect(result).toEqual(mockConcepto);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.conceptoPago.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Concepto #999 no encontrado');
    });
  });

  describe('create', () => {
    it('should create a concepto', async () => {
      const dto = {
        nombre: 'Anuario',
        descripcion: 'Anuario 2026',
        montoSugerido: 150,
      };
      prisma.conceptoPago.create.mockResolvedValue({ ...mockConcepto, nombre: 'Anuario' });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(prisma.conceptoPago.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Anuario',
          descripcion: 'Anuario 2026',
          montoSugerido: 150,
          fechaLimite: undefined,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a concepto', async () => {
      prisma.conceptoPago.findUnique.mockResolvedValue(mockConcepto);
      prisma.conceptoPago.update.mockResolvedValue({ ...mockConcepto, nombre: 'Casaca 2026' });

      const result = await service.update(1, { nombre: 'Casaca 2026' });

      expect(result.nombre).toBe('Casaca 2026');
      expect(prisma.conceptoPago.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft-delete a concepto', async () => {
      prisma.conceptoPago.findUnique.mockResolvedValue(mockConcepto);
      prisma.conceptoPago.update.mockResolvedValue({ ...mockConcepto, activo: false });

      const result = await service.remove(1);

      expect(result.activo).toBe(false);
      expect(prisma.conceptoPago.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { activo: false },
        }),
      );
    });
  });
});
