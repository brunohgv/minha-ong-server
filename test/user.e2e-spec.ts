import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { UserModule } from '../src/user/user.module';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/user/user.entity';
import { OngEntity } from '../src/ong/ong.entity';
import { AppModule } from '../src/app.module';

let app: INestApplication;
let userRepository: Repository<UserEntity>;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
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
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  userRepository = moduleFixture.get<UserRepos>('UserRepository');
});

afterEach(async () => {
  await userRepository.query(`DELETE FROM users;`);
});

describe('GET /users', () => {
  it('should return an array of users', async () => {
    const users = userRepository.create([
      {
        username: 'test',
        email: 'test@test.com',
        password: '123456',
      },
      {
        username: 'test2',
        email: 'test2@test.com',
        password: '123456',
      },
    ]);
    await userRepository.save(users);

    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200);
  });
});

afterEach(async () => {
  await app.close();
});
