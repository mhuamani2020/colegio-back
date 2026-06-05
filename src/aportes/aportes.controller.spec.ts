import { Test, TestingModule } from '@nestjs/testing';
import { AportesController } from './aportes.controller';
import { AportesService } from './aportes.service';

describe('AportesController', () => {
  let controller: AportesController;
  let service: any;

  const mockAporte = {
    id: 1,
    usuarioId: 1,
    conceptoId: 1,
    monto: 150,
    estado: 'pendiente',
    concepto: { id: 1, nombre: 'Casaca' },
    usuario: { id: 1, nombre: 'Test', apellido: 'User' },
    comprobantes: [],
  };

  const mockUser = { id: 1, rol: 'padre' };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockAporte]),
      create: jest.fn().mockResolvedValue(mockAporte),
      agregarComprobante: jest.fn().mockResolvedValue({ id: 1, url: 'https://test.com/img.jpg' }),
      validar: jest.fn().mockResolvedValue({ ...mockAporte, estado: 'aprobado', validadoPor: 2 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AportesController],
      providers: [{ provide: AportesService, useValue: service }],
    }).compile();

    controller = module.get<AportesController>(AportesController);
  });

  describe('findAll', () => {
    it('should return aportes with query params', async () => {
      const query = { estado: 'pendiente' };
      const result = await controller.findAll(mockUser as any, query);

      expect(service.findAll).toHaveBeenCalledWith(mockUser, query);
      expect(result).toEqual([mockAporte]);
    });
  });

  describe('create', () => {
    it('should create an aporte', async () => {
      const dto = { conceptoId: 1, monto: 150 };
      const result = await controller.create(1, dto);

      expect(service.create).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockAporte);
    });
  });

  describe('agregarComprobante', () => {
    it('should add comprobante to aporte', async () => {
      const dto = { url: 'https://test.com/img.jpg', publicId: 'test', tipoMime: 'image/jpeg' };
      const result = await controller.agregarComprobante(1, 1, dto);

      expect(service.agregarComprobante).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('validar', () => {
    it('should validate an aporte', async () => {
      const dto = { estado: 'aprobado' as const };
      const result = await controller.validar(1, 2, dto);

      expect(service.validar).toHaveBeenCalledWith(1, 2, dto);
      expect(result.estado).toBe('aprobado');
    });
  });
});
