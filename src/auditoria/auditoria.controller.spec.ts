import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaController', () => {
  let controller: AuditoriaController;
  let service: any;

  const mockLog = {
    id: 1,
    accion: 'login',
    entidad: 'usuario',
    entidadId: 1,
    usuario: { id: 1, nombre: 'Admin', apellido: 'User', email: 'admin@test.com' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockLog]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaController],
      providers: [{ provide: AuditoriaService, useValue: service }],
    }).compile();

    controller = module.get<AuditoriaController>(AuditoriaController);
  });

  describe('findAll', () => {
    it('should return audit logs without filters', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith({
        usuarioId: undefined,
        accion: undefined,
        entidad: undefined,
        desde: undefined,
        hasta: undefined,
      });
      expect(result).toEqual([mockLog]);
    });

    it('should pass query params as filters', async () => {
      await controller.findAll('1', 'login', 'usuario', '2026-01-01', '2026-12-31');

      expect(service.findAll).toHaveBeenCalledWith({
        usuarioId: 1,
        accion: 'login',
        entidad: 'usuario',
        desde: '2026-01-01',
        hasta: '2026-12-31',
      });
    });
  });
});
