import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('DocumentosService', () => {
  let service: DocumentosService;
  let prisma: any;
  let notificacionesService: any;
  let auditoriaService: any;

  const mockDocumento = {
    id: 1,
    titulo: 'Acta de reunión',
    descripcion: 'Acta de la primera reunión',
    categoriaId: 1,
    url: 'https://res.cloudinary.com/test/acta.pdf',
    publicId: 'documentos/acta-1',
    tipoMime: 'application/pdf',
    fechaDocumento: new Date(),
    subidoPor: 1,
    categoria: { id: 1, nombre: 'Acta' },
    subidor: { id: 1, nombre: 'Admin', apellido: 'User' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      documento: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      usuario: {
        findMany: jest.fn(),
      },
    };

    notificacionesService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    auditoriaService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificacionesService, useValue: notificacionesService },
        { provide: AuditoriaService, useValue: auditoriaService },
      ],
    }).compile();

    service = module.get<DocumentosService>(DocumentosService);
  });

  describe('findAll', () => {
    it('should return all documentos without filters', async () => {
      prisma.documento.findMany.mockResolvedValue([mockDocumento]);

      const result = await service.findAll({});

      expect(result).toEqual([mockDocumento]);
      expect(prisma.documento.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          categoria: { select: { id: true, nombre: true } },
          subidor: { select: { id: true, nombre: true, apellido: true } },
        },
        orderBy: { fechaDocumento: 'desc' },
      });
    });

    it('should filter by categoriaId', async () => {
      prisma.documento.findMany.mockResolvedValue([mockDocumento]);

      await service.findAll({ categoriaId: 1 });

      expect(prisma.documento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoriaId: 1 },
        }),
      );
    });

    it('should search by title', async () => {
      prisma.documento.findMany.mockResolvedValue([mockDocumento]);

      await service.findAll({ search: 'acta' });

      expect(prisma.documento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { titulo: { contains: 'acta', mode: 'insensitive' } },
              { descripcion: { contains: 'acta', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a documento by id', async () => {
      prisma.documento.findUniqueOrThrow.mockResolvedValue(mockDocumento);

      const result = await service.findOne(1);
      expect(result).toEqual(mockDocumento);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.documento.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a documento and notify users', async () => {
      const dto = {
        titulo: 'Acta de reunión',
        categoriaId: 1,
        url: 'https://res.cloudinary.com/test/acta.pdf',
        publicId: 'documentos/acta-1',
        tipoMime: 'application/pdf',
      };

      prisma.documento.create.mockResolvedValue(mockDocumento);
      prisma.usuario.findMany.mockResolvedValue([
        { id: 2 },
        { id: 3 },
      ]);

      const result = await service.create(1, dto);

      expect(result).toEqual(mockDocumento);
      expect(notificacionesService.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    it('should delete a documento by the uploader', async () => {
      prisma.documento.findUniqueOrThrow.mockResolvedValue(mockDocumento);
      prisma.documento.delete.mockResolvedValue(mockDocumento);

      const result = await service.remove(1, 1, 'padre');

      expect(result).toEqual(mockDocumento);
      expect(prisma.documento.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should delete a documento by admin role', async () => {
      prisma.documento.findUniqueOrThrow.mockResolvedValue(mockDocumento);
      prisma.documento.delete.mockResolvedValue(mockDocumento);

      const result = await service.remove(1, 2, 'super_admin');

      expect(result).toEqual(mockDocumento);
    });

    it('should throw when user is not owner or admin', async () => {
      prisma.documento.findUniqueOrThrow.mockResolvedValue(mockDocumento);

      await expect(service.remove(1, 2, 'padre')).rejects.toThrow(NotFoundException);
    });
  });
});
