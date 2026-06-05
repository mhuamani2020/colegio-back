import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasDocumentoService } from './categorias-documento.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriasDocumentoService', () => {
  let service: CategoriasDocumentoService;
  let prisma: any;

  const mockCategoria = {
    id: 1,
    nombre: 'Acta',
    descripcion: 'Actas de reunión',
    _count: { documentos: 3 },
  };

  beforeEach(async () => {
    prisma = {
      categoriaDocumento: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasDocumentoService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriasDocumentoService>(CategoriasDocumentoService);
  });

  describe('findAll', () => {
    it('should return all categorias with document count', async () => {
      prisma.categoriaDocumento.findMany.mockResolvedValue([mockCategoria]);

      const result = await service.findAll();
      expect(result).toEqual([mockCategoria]);
      expect(prisma.categoriaDocumento.findMany).toHaveBeenCalledWith({
        orderBy: { nombre: 'asc' },
        include: { _count: { select: { documentos: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a categoria by id', async () => {
      prisma.categoriaDocumento.findUniqueOrThrow.mockResolvedValue(mockCategoria);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCategoria);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.categoriaDocumento.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.findOne(999)).rejects.toThrow('Categoría #999 no encontrada');
    });
  });

  describe('create', () => {
    it('should create a categoria', async () => {
      const dto = { nombre: 'Contrato', descripcion: 'Contratos firmados' };
      prisma.categoriaDocumento.create.mockResolvedValue({ id: 2, ...dto, _count: { documentos: 0 } });

      const result = await service.create(dto);
      expect(prisma.categoriaDocumento.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a categoria', async () => {
      prisma.categoriaDocumento.findUniqueOrThrow.mockResolvedValue(mockCategoria);
      prisma.categoriaDocumento.update.mockResolvedValue({ ...mockCategoria, nombre: 'Actas' });

      const result = await service.update(1, { nombre: 'Actas' });
      expect(prisma.categoriaDocumento.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nombre: 'Actas' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a categoria', async () => {
      prisma.categoriaDocumento.findUniqueOrThrow.mockResolvedValue(mockCategoria);
      prisma.categoriaDocumento.delete.mockResolvedValue(mockCategoria);

      const result = await service.remove(1);
      expect(prisma.categoriaDocumento.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
