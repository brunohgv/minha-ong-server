import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngEntity } from '../ong/ong.entity';
import { getRepository, Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserLoginDTO, UserVO, UserRegisterDTO } from './user.dto';
dotenv.config();

describe('User Controller', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;
  let userController: UserController;
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'root',
          database: 'e2e_test',
          entities: [UserEntity, OngEntity],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([UserEntity, OngEntity]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userRepository = getRepository(UserEntity);
    userService = new UserService(userRepository);
    userController = new UserController(userService);
  });

  describe('Get users', () => {
    it('should return the service response', async () => {
      const result = [];
      jest
        .spyOn(userService, 'getAll')
        .mockImplementation(async () => await result);
      expect(await userController.getAllUsers()).toBe(result);
      expect(userService.getAll).toHaveBeenCalled();
    });
  });

  describe('Login', () => {
    it('should return the service response when the input is ok', async () => {
      const result = new UserVO();
      jest.spyOn(userService, 'login').mockImplementation(async () => result);

      const loginObject: UserLoginDTO = {
        email: 'test@test.com',
        password: 'password',
      };

      expect(await userController.login(loginObject)).toBe(result);
      expect(userService.login).toHaveBeenCalled();
    });
  });

  describe('Register', () => {
    it('should return the service response when register is succeded', async () => {
      const result = new UserVO();
      jest
        .spyOn(userService, 'register')
        .mockImplementation(async () => result);

      const registerObject: UserRegisterDTO = {
        email: 'test@test.com',
        username: 'test',
        password: 'password',
      };

      expect(await userController.register(registerObject)).toBe(result);
      expect(userService.register).toHaveBeenCalled();
    });
  });
});
