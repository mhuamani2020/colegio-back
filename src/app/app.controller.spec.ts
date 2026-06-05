import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return data from service', () => {
      const expected = { message: 'Hello API' };
      jest.spyOn(service, 'getData').mockReturnValue(expected);

      const result = controller.getData();
      expect(result).toEqual(expected);
      expect(service.getData).toHaveBeenCalled();
    });
  });
});
