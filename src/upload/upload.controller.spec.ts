import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: any;

  const mockSignature = {
    signature: 'abc123signature',
    timestamp: 1234567890,
    cloudName: 'test-cloud',
    apiKey: 'test-key',
    folder: 'comprobantes',
  };

  beforeEach(async () => {
    service = {
      generateSignature: jest.fn().mockReturnValue(mockSignature),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: service }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  describe('getSignature', () => {
    it('should return signature with default folder when no query', async () => {
      const result = await controller.getSignature({ folder: undefined } as any);
      expect(service.generateSignature).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockSignature);
    });

    it('should return signature with specified folder', async () => {
      const result = await controller.getSignature({ folder: 'documentos' } as any);
      expect(service.generateSignature).toHaveBeenCalledWith('documentos');
      expect(result).toEqual(mockSignature);
    });
  });
});
