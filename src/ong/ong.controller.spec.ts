import { Test, TestingModule } from '@nestjs/testing';
import { OngController } from './ong.controller';

describe('Ong Controller', () => {
  let controller: OngController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OngController],
    }).compile();

    controller = module.get<OngController>(OngController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
