import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: any;

  const mockUser = {
    id: 1,
    email: 'admin@test.com',
    nombre: 'Admin',
    apellido: 'User',
    telefono: '999888777',
    activo: true,
    rol: { id: 1, nombre: 'super_admin' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockUser]),
      findOne: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      getMe: jest.fn().mockResolvedValue(mockUser),
      updateProfile: jest.fn().mockResolvedValue(mockUser),
      changePassword: jest.fn().mockResolvedValue({ message: 'Contraseña actualizada correctamente' }),
      toggleActivo: jest.fn().mockResolvedValue({ ...mockUser, activo: false }),
      remove: jest.fn().mockResolvedValue({ ...mockUser, activo: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [{ provide: UsuariosService, useValue: service }],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      const result = await controller.getMe(1);
      expect(service.getMe).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      const dto = { nombre: 'Updated' };
      const result = await controller.updateProfile(1, dto);
      expect(service.updateProfile).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const dto = { currentPassword: 'Old123!', newPassword: 'New123!' };
      const result = await controller.changePassword(1, dto);
      expect(service.changePassword).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ message: 'Contraseña actualizada correctamente' });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return one user', async () => {
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = {
        email: 'new@test.com',
        password: 'Password123!',
        nombre: 'New',
        apellido: 'User',
        rolId: 6,
      };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { nombre: 'Updated' };
      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('toggleActivo', () => {
    it('should toggle user active status', async () => {
      const result = await controller.toggleActivo(1);
      expect(service.toggleActivo).toHaveBeenCalledWith(1);
      expect(result.activo).toBe(false);
    });
  });

  describe('remove', () => {
    it('should soft-delete a user', async () => {
      const result = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.activo).toBe(false);
    });
  });
});
