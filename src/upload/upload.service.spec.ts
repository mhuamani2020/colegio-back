import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';

describe('UploadService', () => {
  let service: UploadService;
  let configService: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('generateSignature', () => {
    it('should generate a signature with default folder', () => {
      configService.getOrThrow.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };
        return map[key];
      });

      const result = service.generateSignature();

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('timestamp');
      expect(result.cloudName).toBe('test-cloud');
      expect(result.apiKey).toBe('test-key');
      expect(result.folder).toBe('general');
      expect(typeof result.signature).toBe('string');
      expect(result.signature.length).toBeGreaterThan(0);
    });

    it('should generate a signature with custom folder', () => {
      configService.getOrThrow.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };
        return map[key];
      });

      const result = service.generateSignature('comprobantes');

      expect(result.folder).toBe('comprobantes');
    });

    it('should throw when cloudinary credentials are missing', () => {
      configService.getOrThrow.mockImplementation(() => {
        throw new Error('Missing config');
      });

      expect(() => service.generateSignature()).toThrow('Missing config');
    });
  });

  describe('getResourceUrl', () => {
    it('should return empty string when cloud name is not set', () => {
      configService.get.mockReturnValue(undefined);

      const result = service.getResourceUrl('test-public-id');
      expect(result).toBe('');
    });
  });
});
