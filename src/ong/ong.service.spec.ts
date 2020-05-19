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
import { OngVO } from './ong.dto';
dotenv.config();

describe('Ong Service', () => {
  let ongService: OngService;
  let userRepository: Repository<UserEntity>;
  let ongRepository: Repository<OngEntity>;
  let app: TestingModule;
  let testUser: UserVO;
  let testUser2: UserVO;
  let persistedOng: OngEntity;
  let persistedOng2: OngEntity;

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
    const user2 = userRepository.create({
      username: 'test2',
      email: 'test2@test.com',
      password: 'password',
    });
    testUser2 = (await userRepository.save(user2)).toResponseObject();
    const ong = ongRepository.create({
      name: 'test ong',
      description: 'test description',
      createdYear: 2020,
      creator: testUser,
    });
    persistedOng = await ongRepository.save(ong);
    const ong2 = ongRepository.create({
      name: 'test ong 2',
      description: 'test description',
      createdYear: 2020,
      creator: testUser,
    });
    persistedOng2 = await ongRepository.save(ong2);
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

  afterAll(async () => {
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

    await app.close();
  });

  describe('Get All', () => {
    it('should return all the ongs', async () => {
      const result = await ongService.getAll();

      expect(result).toContainEqual(persistedOng);
      expect(result).toContainEqual(persistedOng2);
      expect(result).toHaveLength(2);
    });
  });

  describe('Get Ong by ID', () => {
    it('should get the ong if an ong with the ID exists', async () => {
      const retrievedOng = await ongService.getById(persistedOng.id);
      expect(retrievedOng).not.toBeNull();
      expect(retrievedOng.id).toEqual(persistedOng.id);
      expect(retrievedOng).toHaveProperty('id');
      expect(retrievedOng).toHaveProperty('name');
      expect(retrievedOng).toHaveProperty('description');
      expect(retrievedOng).toHaveProperty('createdYear');
      expect(retrievedOng).toHaveProperty('created');
      expect(retrievedOng).toHaveProperty('updated');
      expect(retrievedOng).toHaveProperty('creator');
    });

    it('should throw an error if there is no ong with the informed ID', async () => {
      const fakeUUID = 'f9fe57cd-8929-449d-9187-de0c135884fe';
      async function getOngWithFalseUUID() {
        return await ongService.getById(fakeUUID);
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
        name: 'my test ong',
        description: 'my test description',
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
      const newOng = {
        name: 'test ong',
        description: 'test description',
        createdYear: 2020,
      };

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

  describe('Update Ong', () => {
    it('should update when everything is ok', async () => {
      const patchOng = {
        name: 'updated test ong',
        description: 'updated test description',
      };

      const updatedOng = await ongService.update(
        testUser.id,
        persistedOng.id,
        patchOng,
      );

      expect(updatedOng).not.toBeNull();
      expect(updatedOng).not.toEqual(persistedOng);
      expect(updatedOng.name).toEqual(patchOng.name);
      expect(updatedOng.description).toEqual(patchOng.description);
      expect(updatedOng.createdYear).toEqual(persistedOng.createdYear);
      expect(updatedOng.creator).toEqual(updatedOng.creator);
    });

    it('should throw error when try to update an ong that does not exists', async () => {
      const fakeUUID = '4f156fde-ef82-4923-ab28-77b667694342';
      const patchOng = {
        name: 'updated test ong',
        description: 'updated test description',
      };

      async function updateOngWithWrongUUID() {
        return await ongService.update(testUser.id, fakeUUID, patchOng);
      }

      try {
        await updateOngWithWrongUUID();
      } catch (error) {
        expect(error.message).toEqual('There is no Ong with this ID');
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }

      await expect(updateOngWithWrongUUID).rejects.toThrowError(HttpException);
    });

    it('should throw error when try to update with an user that is not the creator', async () => {
      const patchOng = {
        name: 'updated test ong',
        description: 'updated test description',
      };

      async function updateWithOtherUser() {
        await ongService.update(testUser2.id, persistedOng.id, patchOng);
      }

      try {
        await updateWithOtherUser();
      } catch (error) {
        expect(error.message).toEqual(
          "You don't have permission to do this operation",
        );
        expect(error.status).toEqual(HttpStatus.UNAUTHORIZED);
      }

      await expect(updateWithOtherUser).rejects.toThrowError(HttpException);
    });
  });

  describe('Delete Ong', () => {
    it('should delete an ong if everything is ok', async () => {
      const deletedOng = await ongService.delete(testUser.id, persistedOng.id);
      expect(deletedOng).toEqual(persistedOng);
      const deletedOngSearch = await ongRepository.findOne(persistedOng.id);
      expect(deletedOngSearch).toBeUndefined();
    });
    it('should throw error when try to delete an ong that does not exists', async () => {
      const fakeUUID = 'c7d48eef-cf5e-4050-85c4-2c04d1e7327e';

      async function deleteOngWithWrongUUID() {
        return await ongService.delete(testUser.id, fakeUUID);
      }

      try {
        await deleteOngWithWrongUUID();
      } catch (error) {
        expect(error.message).toEqual('There is no Ong with this ID');
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }

      await expect(deleteOngWithWrongUUID).rejects.toThrowError(HttpException);
    });

    it('should throw error when try to delete an ong when the user not the creator', async () => {
      async function deleteWithOtherUser() {
        await ongService.delete(testUser2.id, persistedOng.id);
      }

      try {
        await deleteWithOtherUser();
      } catch (error) {
        expect(error.message).toEqual(
          "You don't have permission to do this operation",
        );
        expect(error.status).toEqual(HttpStatus.UNAUTHORIZED);
      }

      await expect(deleteWithOtherUser).rejects.toThrowError(HttpException);
    });
  });
});
