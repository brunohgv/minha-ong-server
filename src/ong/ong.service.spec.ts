import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngEntity } from './ong.entity';
import { getRepository, Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { OngService } from './ong.service';
import { UserVO } from '../user/user.dto';
import { HttpStatus, HttpException } from '@nestjs/common';
dotenv.config();

// Used for test only (copyed from https://stackoverflow.com/questions/105034/how-to-create-guid-uuid)
function generateRandomUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

describe('Ong Service', () => {
  let ongService: OngService;
  let userRepository: Repository<UserEntity>;
  let ongRepository: Repository<OngEntity>;
  let app: TestingModule;
  let testUser: UserVO;

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

    userRepository = getRepository<UserEntity>(UserEntity);
    ongRepository = getRepository<OngEntity>(OngEntity);
    ongService = new OngService(ongRepository, userRepository);
  });

  beforeEach(async () => {
    const user = userRepository.create({
      username: 'test',
      email: 'test@test.com',
      password: 'password',
    });
    testUser = (await userRepository.save(user)).toResponseObject();
  });

  afterEach(async () => {
    await ongRepository
      .createQueryBuilder()
      .delete()
      .from(OngEntity)
      .execute();

    await userRepository
      .createQueryBuilder()
      .delete()
      .from(UserEntity)
      .execute();
  });

  describe('Get All', () => {
    it('should return all the ongs', async () => {
      const testOng1 = ongRepository.create({
        name: 'test ong',
        description: 'test description',
        createdYear: 2020,
        creator: testUser,
      });
      const testOng2 = ongRepository.create({
        name: 'test ong 2',
        description: 'test description',
        createdYear: 2020,
        creator: testUser,
      });

      await ongRepository.save([testOng1, testOng2]);

      const result = await ongService.getAll();

      expect(result).toContainEqual(testOng1);
      expect(result).toContainEqual(testOng2);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array if have no ongs', async () => {
      const result = await ongService.getAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('Get Ong by ID', () => {
    it('should get the ong if an ong with the ID exists', async () => {
      const testOng = ongRepository.create({
        name: 'test ong',
        description: 'test description',
        createdYear: 2020,
        creator: testUser,
      });

      await ongRepository.save(testOng);

      const retrievedOng = await ongService.getById(testOng.id);
      expect(retrievedOng).not.toBeNull();
      expect(retrievedOng.id).toEqual(testOng.id);
      expect(retrievedOng).toHaveProperty('id');
      expect(retrievedOng).toHaveProperty('name');
      expect(retrievedOng).toHaveProperty('description');
      expect(retrievedOng).toHaveProperty('createdYear');
      expect(retrievedOng).toHaveProperty('created');
      expect(retrievedOng).toHaveProperty('updated');
      expect(retrievedOng).toHaveProperty('creator');
    });

    it('should throw an error if there is no ong with the informed ID', async () => {
      async function getOngWithFalseUUID() {
        return await ongService.getById(generateRandomUUIDv4());
      }

      try {
        await getOngWithFalseUUID();
      } catch (error) {
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
        expect(error.message).toEqual('There is no Ong with this ID');
      }

      await expect(getOngWithFalseUUID).rejects.toThrow(HttpException);
    });
  });

  describe('create ong', () => {
    it('should save an ong if everything is ok', async () => {
      const userId = testUser.id;
      const testOng = {
        name: 'test ong',
        description: 'test description',
        createdYear: 2020,
      };

      const result = await ongService.create(userId, testOng);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('creator');
      expect(result.creator).toEqual(testUser);
      expect(result).toHaveProperty('id');
      expect(result.name).toEqual(testOng.name);
      expect(result.description).toEqual(testOng.description);
      expect(result.createdYear).toEqual(testOng.createdYear);
    });

    it('should throw error when saving an ong with the same name', async () => {
      const userId = testUser.id;
      const persistedOng = {
        name: 'test ong',
        description: 'test description',
        createdYear: 2020,
      };
      const newOng = {
        name: 'test ong',
        description: 'test description',
        createdYear: 2020,
      };
      ongRepository.create(persistedOng);
      await ongRepository.save(persistedOng);

      async function doCreateOng() {
        return await ongService.create(userId, newOng);
      }

      try {
        await doCreateOng();
      } catch (error) {
        expect(error.message).toEqual('An ONG with that name already exists');
        expect(error.status).toEqual(HttpStatus.CONFLICT);
      }

      await expect(doCreateOng).rejects.toThrow(HttpException);
    });
  });

  // describe('Update Ong', () => {});
  // describe('Delete Ong', () => {});
});
