import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: any;
  let auditoriaService: any;

  const mockUsuario = {
    id: 1,
    email: 'test@test.com',
    nombre: 'Test',
    apellido: 'User',
    telefono: '999888777',
    activo: true,
    passwordHash: '$2b$12$hashed',
    rolId: 6,
    rol: { id: 6, nombre: 'padre' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const selectFields = expect.objectContaining({
    id: true,
    email: true,
    nombre: true,
    apellido: true,
    telefono: true,
    activo: true,
    rol: { select: { id: true, nombre: true } },
  });

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    auditoriaService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditoriaService, useValue: auditoriaService },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);

      const result = await service.getMe(1);
      expect(result).toEqual(mockUsuario);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.getMe(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users ordered by name', async () => {
      prisma.usuario.findMany.mockResolvedValue([mockUsuario]);

      const result = await service.findAll();
      expect(result).toEqual([mockUsuario]);
      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({ id: true }),
        orderBy: { nombre: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUsuario);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      email: 'nuevo@test.com',
      password: 'Password123!',
      nombre: 'Nuevo',
      apellido: 'Usuario',
      rolId: 6,
      telefono: '999888777',
    };

    it('should throw ConflictException when email exists', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should create a new user', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      prisma.usuario.create.mockResolvedValue(mockUsuario);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: {
          email: 'nuevo@test.com',
          passwordHash: 'hashed-password',
          nombre: 'Nuevo',
          apellido: 'Usuario',
          telefono: '999888777',
          rolId: 6,
        },
        select: selectFields,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.update.mockResolvedValue({ ...mockUsuario, nombre: 'Updated' });

      const result = await service.updateProfile(1, { nombre: 'Updated' });

      expect(result).toBeDefined();
      expect(prisma.usuario.update).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
    };

    it('should throw NotFoundException when user not found', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(999, changePasswordDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when new password equals current', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...mockUsuario,
        passwordHash: '$2b$12$hashed',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(
        service.changePassword(1, { currentPassword: 'same', newPassword: 'same' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should change password successfully', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed' as never);
      prisma.usuario.update.mockResolvedValue(mockUsuario);

      const result = await service.changePassword(1, changePasswordDto);

      expect(result).toEqual({ message: 'Contraseña actualizada correctamente' });
    });
  });

  describe('toggleActivo', () => {
    it('should toggle user active status', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.update.mockResolvedValue({ ...mockUsuario, activo: false });

      const result = await service.toggleActivo(1);
      expect(prisma.usuario.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft-delete a user', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.update.mockResolvedValue({ ...mockUsuario, activo: false });

      const result = await service.remove(1);
      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { activo: false },
        }),
      );
    });
  });
});
