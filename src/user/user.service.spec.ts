import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngEntity } from '../ong/ong.entity';
import { getRepository, Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { HttpException, HttpStatus } from '@nestjs/common';
dotenv.config();

describe('User Service', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;
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
  });

  afterEach(async () => {
    await userRepository
      .createQueryBuilder()
      .delete()
      .from(UserEntity)
      .execute();
  });

  describe('Get All Users', () => {
    it('Should return all users', async () => {
      const user1 = userRepository.create({
        email: 'test1@test.com',
        username: 'test1',
        password: 'password',
      });
      const user2 = userRepository.create({
        email: 'test2@test.com',
        username: 'test2',
        password: 'password',
      });
      await userRepository.save([user1, user2]);

      const users = await userService.getAll();

      expect(users).toContainEqual({ ...user1.toResponseObject(), ongs: [] });
      expect(users).toContainEqual({ ...user2.toResponseObject(), ongs: [] });
      expect(users.length).toEqual(2);
    });

    it('should return an empty list if have no users', async () => {
      const users = await userService.getAll();
      expect(users).toEqual([]);
      expect(users.length).toEqual(0);
    });
  });

  describe('Login', () => {
    it('should return a token if login is succeded', async () => {
      const testUser = userRepository.create({
        email: 'test@test.com',
        username: 'test',
        password: 'password',
      });

      await userRepository.save(testUser);

      const response = await userService.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(Object.keys(response)).toContain('token');
      expect(response.token.length).toBeGreaterThan(0);
    });

    it('should return a UNAUTHORIZED http response if the password is incorrect', async () => {
      const testUser = userRepository.create({
        email: 'test@test.com',
        username: 'test',
        password: 'password',
      });

      await userRepository.save(testUser);

      async function doLogin() {
        await userService.login({
          email: 'test@test.com',
          password: 'incorrectpassword',
        });
      }

      expect(doLogin).rejects.toThrow(
        new HttpException('Incorrect Password', HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
