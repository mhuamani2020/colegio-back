import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockLoginResponse = {
    token: 'mock-token',
    user: { id: 1, email: 'test@test.com', nombre: 'Test', apellido: 'User', rol: 'padre' },
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue(mockLoginResponse),
      register: jest.fn().mockResolvedValue(mockLoginResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto: LoginDto = { email: 'test@test.com', password: 'Password123!' };
      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto: RegisterDto = {
        email: 'nuevo@test.com',
        password: 'Password123!',
        nombre: 'Nuevo',
        apellido: 'Usuario',
        rolId: 6,
      };
      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockLoginResponse);
    });
  });
});
