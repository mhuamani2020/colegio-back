import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasDocumentoController } from './categorias-documento.controller';
import { CategoriasDocumentoService } from './categorias-documento.service';

describe('CategoriasDocumentoController', () => {
  let controller: CategoriasDocumentoController;
  let service: any;

  const mockCategoria = {
    id: 1,
    nombre: 'Acta',
    descripcion: 'Actas de reunión',
    _count: { documentos: 3 },
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockCategoria]),
      findOne: jest.fn().mockResolvedValue(mockCategoria),
      create: jest.fn().mockResolvedValue(mockCategoria),
      update: jest.fn().mockResolvedValue(mockCategoria),
      remove: jest.fn().mockResolvedValue(mockCategoria),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasDocumentoController],
      providers: [{ provide: CategoriasDocumentoService, useValue: service }],
    }).compile();

    controller = module.get<CategoriasDocumentoController>(CategoriasDocumentoController);
  });

  it('findAll should return all categorias', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockCategoria]);
  });

  it('findOne should return one categoria', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockCategoria);
  });

  it('create should create a categoria', async () => {
    const dto = { nombre: 'Contrato' };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockCategoria);
  });

  it('update should update a categoria', async () => {
    const dto = { nombre: 'Actas' };
    const result = await controller.update(1, dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(mockCategoria);
  });

  it('remove should delete a categoria', async () => {
    const result = await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockCategoria);
  });
});
