import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AportesService } from './aportes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

describe('AportesService', () => {
  let service: AportesService;
  let prisma: any;
  let auditoriaService: any;
  let notificacionesService: any;

  const mockAporte = {
    id: 1,
    usuarioId: 1,
    conceptoId: 1,
    monto: 150,
    descripcion: 'Pago parcial',
    estado: 'pendiente',
    motivoRechazo: null,
    fechaAporte: new Date(),
    validadoPor: null,
    validadoEn: null,
    alumnoId: null,
    concepto: { id: 1, nombre: 'Casaca', montoSugerido: 200 },
    alumno: null,
    usuario: { id: 1, nombre: 'Test', apellido: 'User' },
    comprobantes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      aporte: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      comprobante: {
        create: jest.fn(),
      },
    };

    auditoriaService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    notificacionesService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AportesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditoriaService, useValue: auditoriaService },
        { provide: NotificacionesService, useValue: notificacionesService },
      ],
    }).compile();

    service = module.get<AportesService>(AportesService);
  });

  describe('findAll', () => {
    const mockUserPadre = { id: 1, rol: 'padre' };
    const mockUserAdmin = { id: 2, rol: 'super_admin' };

    it('should return only own aportes for padre role', async () => {
      prisma.aporte.findMany.mockResolvedValue([mockAporte]);

      const result = await service.findAll(mockUserPadre, {});

      expect(result).toEqual([mockAporte]);
      expect(prisma.aporte.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: 1 },
        }),
      );
    });

    it('should return all aportes for admin role', async () => {
      prisma.aporte.findMany.mockResolvedValue([mockAporte]);

      const result = await service.findAll(mockUserAdmin, {});

      expect(result).toEqual([mockAporte]);
      expect(prisma.aporte.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should filter by estado', async () => {
      prisma.aporte.findMany.mockResolvedValue([mockAporte]);

      await service.findAll(mockUserAdmin, { estado: 'pendiente' });

      expect(prisma.aporte.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: 'pendiente' },
        }),
      );
    });

    it('should filter by conceptoId', async () => {
      prisma.aporte.findMany.mockResolvedValue([mockAporte]);

      await service.findAll(mockUserAdmin, { conceptoId: 1 });

      expect(prisma.aporte.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conceptoId: 1 },
        }),
      );
    });
  });

  describe('create', () => {
    it('should create an aporte and log audit', async () => {
      const dto = { conceptoId: 1, monto: 150, descripcion: 'Pago parcial' };
      prisma.aporte.create.mockResolvedValue(mockAporte);

      const result = await service.create(1, dto);

      expect(result).toEqual(mockAporte);
      expect(auditoriaService.log).toHaveBeenCalledWith({
        usuarioId: 1,
        accion: 'crear_aporte',
        entidad: 'aporte',
        entidadId: 1,
        detalle: { monto: 150, conceptoId: 1 },
      });
    });
  });

  describe('agregarComprobante', () => {
    it('should throw NotFoundException when aporte not found', async () => {
      prisma.aporte.findUnique.mockResolvedValue(null);

      await expect(
        service.agregarComprobante(999, 1, { url: 'https://test.com/img.jpg', publicId: 'test', tipoMime: 'image/jpeg' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not the owner', async () => {
      prisma.aporte.findUnique.mockResolvedValue(mockAporte);

      await expect(
        service.agregarComprobante(1, 2, { url: 'https://test.com/img.jpg', publicId: 'test', tipoMime: 'image/jpeg' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should add comprobante successfully', async () => {
      prisma.aporte.findUnique.mockResolvedValue(mockAporte);
      const mockComprobante = {
        id: 1,
        aporteId: 1,
        url: 'https://test.com/img.jpg',
        publicId: 'test',
        tipoMime: 'image/jpeg',
      };
      prisma.comprobante.create.mockResolvedValue(mockComprobante);

      const result = await service.agregarComprobante(1, 1, {
        url: 'https://test.com/img.jpg',
        publicId: 'test',
        tipoMime: 'image/jpeg',
      });

      expect(result).toEqual(mockComprobante);
    });
  });

  describe('validar', () => {
    it('should throw NotFoundException when aporte not found', async () => {
      prisma.aporte.findUnique.mockResolvedValue(null);

      await expect(
        service.validar(999, 2, { estado: 'aprobado' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when aporte already validated', async () => {
      prisma.aporte.findUnique.mockResolvedValue({ ...mockAporte, estado: 'aprobado' });

      await expect(
        service.validar(1, 2, { estado: 'aprobado' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when rejecting without motivo', async () => {
      prisma.aporte.findUnique.mockResolvedValue(mockAporte);

      await expect(
        service.validar(1, 2, { estado: 'rechazado' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve aporte and notify owner', async () => {
      prisma.aporte.findUnique.mockResolvedValue(mockAporte);
      const approvedAporte = { ...mockAporte, estado: 'aprobado', validadoPor: 2, validadoEn: new Date() };
      prisma.aporte.update.mockResolvedValue(approvedAporte);

      const result = await service.validar(1, 2, { estado: 'aprobado' });

      expect(result.estado).toBe('aprobado');
      expect(auditoriaService.log).toHaveBeenCalled();
      expect(notificacionesService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          usuarioId: 1,
          tipo: 'aporte_aprobado',
        }),
      );
    });

    it('should reject aporte with motivo', async () => {
      prisma.aporte.findUnique.mockResolvedValue(mockAporte);
      const rejectedAporte = {
        ...mockAporte,
        estado: 'rechazado',
        motivoRechazo: 'Comprobante ilegible',
        validadoPor: 2,
        validadoEn: new Date(),
      };
      prisma.aporte.update.mockResolvedValue(rejectedAporte);

      const result = await service.validar(1, 2, {
        estado: 'rechazado',
        motivoRechazo: 'Comprobante ilegible',
      });

      expect(result.estado).toBe('rechazado');
      expect(result.motivoRechazo).toBe('Comprobante ilegible');
      expect(notificacionesService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'aporte_rechazado',
        }),
      );
    });
  });
});
