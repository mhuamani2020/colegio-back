import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';

describe('NotificacionesController', () => {
  let controller: NotificacionesController;
  let service: any;

  const mockNotificacion = {
    id: 1,
    usuarioId: 1,
    titulo: 'Aporte aprobado ✅',
    mensaje: 'Tu aporte ha sido aprobado.',
    tipo: 'aporte_aprobado',
    leida: false,
    createdAt: new Date(),
  };

  const mockRequest = {
    user: { id: 1, email: 'test@test.com', rol: 'padre' },
  };

  beforeEach(async () => {
    service = {
      findAllByUser: jest.fn().mockResolvedValue([mockNotificacion]),
      countUnread: jest.fn().mockResolvedValue(3),
      markAsRead: jest.fn().mockResolvedValue({ count: 1 }),
      markAllAsRead: jest.fn().mockResolvedValue({ count: 3 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacionesController],
      providers: [{ provide: NotificacionesService, useValue: service }],
    }).compile();

    controller = module.get<NotificacionesController>(NotificacionesController);
  });

  describe('findAll', () => {
    it('should return user notificaciones', async () => {
      const result = await controller.findAll(mockRequest as any);
      expect(service.findAllByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockNotificacion]);
    });
  });

  describe('countUnread', () => {
    it('should return unread count', async () => {
      const result = await controller.countUnread(mockRequest as any);
      expect(service.countUnread).toHaveBeenCalledWith(1);
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notificacion as read', async () => {
      const result = await controller.markAsRead(mockRequest as any, '1');
      expect(service.markAsRead).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      const result = await controller.markAllAsRead(mockRequest as any);
      expect(service.markAllAsRead).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count: 3 });
    });
  });
});
