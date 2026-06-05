import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesService } from './notificaciones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificacionesService', () => {
  let service: NotificacionesService;
  let prisma: any;

  const mockNotificacion = {
    id: 1,
    usuarioId: 1,
    titulo: 'Aporte aprobado ✅',
    mensaje: 'Tu aporte ha sido aprobado.',
    tipo: 'aporte_aprobado',
    leida: false,
    entidad: 'aporte',
    entidadId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      notificacion: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
  });

  describe('log', () => {
    it('should create a notificacion', async () => {
      prisma.notificacion.create.mockResolvedValue(mockNotificacion);

      const result = await service.log({
        usuarioId: 1,
        titulo: 'Aporte aprobado ✅',
        mensaje: 'Tu aporte ha sido aprobado.',
        tipo: 'aporte_aprobado',
        entidad: 'aporte',
        entidadId: 1,
      });

      expect(result).toEqual(mockNotificacion);
      expect(prisma.notificacion.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 1,
          titulo: 'Aporte aprobado ✅',
          mensaje: 'Tu aporte ha sido aprobado.',
          tipo: 'aporte_aprobado',
          entidad: 'aporte',
          entidadId: 1,
        },
      });
    });

    it('should handle errors gracefully', async () => {
      prisma.notificacion.create.mockRejectedValue(new Error('DB error'));

      const result = await service.log({
        usuarioId: 1,
        titulo: 'Test',
        mensaje: 'Test',
        tipo: 'test',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('findAllByUser', () => {
    it('should return notificaciones for a user', async () => {
      prisma.notificacion.findMany.mockResolvedValue([mockNotificacion]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([mockNotificacion]);
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('countUnread', () => {
    it('should return unread count', async () => {
      prisma.notificacion.count.mockResolvedValue(5);

      const result = await service.countUnread(1);

      expect(result).toBe(5);
      expect(prisma.notificacion.count).toHaveBeenCalledWith({
        where: { usuarioId: 1, leida: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notificacion as read', async () => {
      prisma.notificacion.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.markAsRead(1, 1);

      expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
        where: { id: 1, usuarioId: 1 },
        data: { leida: true },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notificaciones as read', async () => {
      prisma.notificacion.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(1);

      expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
        where: { usuarioId: 1, leida: false },
        data: { leida: true },
      });
    });
  });
});
