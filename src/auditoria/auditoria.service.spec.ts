import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaService } from './auditoria.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      auditoriaLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditoriaService>(AuditoriaService);
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const params = {
        usuarioId: 1,
        accion: 'login',
        entidad: 'usuario',
        entidadId: 1,
      };
      prisma.auditoriaLog.create.mockResolvedValue({ id: 1, ...params, createdAt: new Date() });

      await service.log(params);

      expect(prisma.auditoriaLog.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 1,
          accion: 'login',
          entidad: 'usuario',
          entidadId: 1,
          detalle: undefined,
          ipAddress: null,
        },
      });
    });

    it('should handle errors gracefully', async () => {
      prisma.auditoriaLog.create.mockRejectedValue(new Error('DB error'));

      await expect(service.log({
        accion: 'test',
      })).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return audit logs with filters', async () => {
      const mockLogs = [
        { id: 1, accion: 'login', usuario: { id: 1, nombre: 'Test', apellido: 'User', email: 'test@test.com' }, createdAt: new Date() },
      ];
      prisma.auditoriaLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.findAll({});

      expect(result).toEqual(mockLogs);
      expect(prisma.auditoriaLog.findMany).toHaveBeenCalledWith({
        where: {},
        include: { usuario: { select: { id: true, nombre: true, apellido: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
    });

    it('should filter by accion', async () => {
      prisma.auditoriaLog.findMany.mockResolvedValue([]);

      await service.findAll({ accion: 'login' });

      expect(prisma.auditoriaLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { accion: { contains: 'login', mode: 'insensitive' } },
        }),
      );
    });

    it('should filter by usuarioId', async () => {
      prisma.auditoriaLog.findMany.mockResolvedValue([]);

      await service.findAll({ usuarioId: 1 });

      expect(prisma.auditoriaLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: 1 },
        }),
      );
    });
  });
});
