import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';

describe('DocumentosController', () => {
  let controller: DocumentosController;
  let service: any;

  const mockDocumento = {
    id: 1,
    titulo: 'Acta de reunión',
    descripcion: 'Acta de la primera reunión',
    categoriaId: 1,
    url: 'https://res.cloudinary.com/test/acta.pdf',
    publicId: 'documentos/acta-1',
    tipoMime: 'application/pdf',
    categoria: { id: 1, nombre: 'Acta' },
    subidor: { id: 1, nombre: 'Admin', apellido: 'User' },
  };

  const mockUser = { id: 1, rol: 'super_admin' };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockDocumento]),
      findOne: jest.fn().mockResolvedValue(mockDocumento),
      create: jest.fn().mockResolvedValue(mockDocumento),
      remove: jest.fn().mockResolvedValue(mockDocumento),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [{ provide: DocumentosService, useValue: service }],
    }).compile();

    controller = module.get<DocumentosController>(DocumentosController);
  });

  describe('findAll', () => {
    it('should return all documentos', async () => {
      const result = await controller.findAll({});
      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual([mockDocumento]);
    });
  });

  describe('findOne', () => {
    it('should return one documento', async () => {
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDocumento);
    });
  });

  describe('create', () => {
    it('should create a documento', async () => {
      const dto = {
        titulo: 'Acta de reunión',
        categoriaId: 1,
        url: 'https://res.cloudinary.com/test/acta.pdf',
        publicId: 'documentos/acta-1',
      };
      const result = await controller.create(mockUser as any, dto);
      expect(service.create).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockDocumento);
    });
  });

  describe('remove', () => {
    it('should delete a documento', async () => {
      const result = await controller.remove(1, mockUser as any);
      expect(service.remove).toHaveBeenCalledWith(1, 1, 'super_admin');
      expect(result).toEqual(mockDocumento);
    });
  });
});
