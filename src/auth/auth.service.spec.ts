import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let auditoriaService: any;

  const mockUsuario = {
    id: 1,
    email: 'test@test.com',
    passwordHash: '$2b$12$hashedpassword',
    nombre: 'Test',
    apellido: 'User',
    activo: true,
    rolId: 6,
    rol: { id: 6, nombre: 'padre' },
  };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    auditoriaService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditoriaService, useValue: auditoriaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    const loginDto = { email: 'test@test.com', password: 'Password123!' };

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ ...mockUsuario, activo: false });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on successful login', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@test.com');
      expect(auditoriaService.log).toHaveBeenCalledWith({
        usuarioId: 1,
        accion: 'login',
        entidad: 'usuario',
        entidadId: 1,
      });
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'nuevo@test.com',
      password: 'Password123!',
      nombre: 'Nuevo',
      apellido: 'Usuario',
      rolId: 6,
    };

    it('should throw ConflictException when email already exists', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should create user and return token', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      prisma.usuario.create.mockResolvedValue(mockUsuario);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user.email).toBe('test@test.com');
      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: {
          email: 'nuevo@test.com',
          passwordHash: 'hashed-password',
          nombre: 'Nuevo',
          apellido: 'Usuario',
          rolId: 6,
        },
        include: { rol: true },
      });
      expect(auditoriaService.log).toHaveBeenCalledWith({
        usuarioId: 1,
        accion: 'registro',
        entidad: 'usuario',
        entidadId: 1,
      });
    });
  });
});
