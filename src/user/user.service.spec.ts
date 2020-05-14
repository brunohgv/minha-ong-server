import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngEntity } from '../ong/ong.entity';
import { getRepository, Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRegisterDTO } from './user.dto';
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

      await expect(doLogin).rejects.toThrow(
        new HttpException('Incorrect Password', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should return an error if the user does not exist', async () => {
      async function doLogin() {
        await userService.login({
          email: 'test@test.com',
          password: 'incorrectpassword',
        });
      }

      try {
        await doLogin();
      } catch (error) {
        expect(error.message).toEqual(
          'There is no registered user with this email',
        );
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }

      await expect(doLogin).rejects.toThrowError(HttpException);
    });
  });

  describe('Register', () => {
    it('should return a new user when register', async () => {
      const testUser = {
        email: 'test@test.com',
        username: 'test',
        password: 'password',
      };

      const response = await userService.register(testUser);

      expect(response).not.toBeNull();
      expect(response).not.toHaveProperty('password');
      expect(response).toHaveProperty('email');
      expect(response).toHaveProperty('username');
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('token');
    });

    it('should fail when the email already exists', async () => {
      const persistedUser: UserRegisterDTO = {
        email: 'test@test.com',
        username: 'test',
        password: 'password',
      };
      await userService.register(persistedUser);

      const newUser: UserRegisterDTO = {
        email: 'test@test.com',
        username: 'test2',
        password: 'password2',
      };

      async function doRegister() {
        return await userService.register(newUser);
      }

      try {
        await doRegister();
      } catch (error) {
        expect(error.message).toEqual(
          'The informed email is already registered',
        );
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }

      await expect(doRegister).rejects.toThrow(HttpException);
    });

    it('should fail when the username already exists', async () => {
      const persistedUser: UserRegisterDTO = {
        email: 'test@test.com',
        username: 'test',
        password: 'password',
      };
      await userService.register(persistedUser);

      const newUser: UserRegisterDTO = {
        email: 'test2@test.com',
        username: 'test',
        password: 'password2',
      };

      async function doRegister() {
        return await userService.register(newUser);
      }

      try {
        await doRegister();
      } catch (error) {
        expect(error.message).toEqual(
          'The informed username is already registered',
        );
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }

      await expect(doRegister).rejects.toThrow(HttpException);
    });
  });
});
