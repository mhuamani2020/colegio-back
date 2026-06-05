import { Test, TestingModule } from '@nestjs/testing';
import { ConceptosController } from './conceptos.controller';
import { ConceptosService } from './conceptos.service';

describe('ConceptosController', () => {
  let controller: ConceptosController;
  let service: any;

  const mockConcepto = {
    id: 1,
    nombre: 'Casaca',
    descripcion: 'Cuota para la casaca',
    montoSugerido: 200,
    activo: true,
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockConcepto]),
      findOne: jest.fn().mockResolvedValue(mockConcepto),
      create: jest.fn().mockResolvedValue(mockConcepto),
      update: jest.fn().mockResolvedValue(mockConcepto),
      remove: jest.fn().mockResolvedValue({ ...mockConcepto, activo: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConceptosController],
      providers: [{ provide: ConceptosService, useValue: service }],
    }).compile();

    controller = module.get<ConceptosController>(ConceptosController);
  });

  describe('findAll', () => {
    it('should return active conceptos by default', async () => {
      const result = await controller.findAll(undefined);
      expect(service.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual([mockConcepto]);
    });

    it('should return all conceptos when query includes all=true', async () => {
      await controller.findAll('true');
      expect(service.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findOne', () => {
    it('should return one concepto', async () => {
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockConcepto);
    });
  });

  describe('create', () => {
    it('should create a concepto', async () => {
      const dto = { nombre: 'Anuario', montoSugerido: 150 };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockConcepto);
    });
  });

  describe('update', () => {
    it('should update a concepto', async () => {
      const dto = { nombre: 'Casaca 2026' };
      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockConcepto);
    });
  });

  describe('remove', () => {
    it('should soft-delete a concepto', async () => {
      const result = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.activo).toBe(false);
    });
  });
});
