import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OngEntity } from './ong.entity';
import { OngDTO, OngVO } from './ong.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class OngService {
  constructor(
    @InjectRepository(OngEntity) private ongRepository: Repository<OngEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private toResponseObject(ong: OngEntity): OngVO {
    return { ...ong, creator: ong.creator.toResponseObject() };
  }

  private checkIfExists(ong: OngEntity): void {
    if (!ong) {
      throw new HttpException(
        'There is no Ong with this ID',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private checkOwnership(ong: OngEntity, userId: string): void {
    if (ong.creator.id !== userId) {
      throw new HttpException(
        "You don't have permission to do this operation",
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getAll(): Promise<OngVO[]> {
    const ongs = await this.ongRepository.find({ relations: ['creator'] });
    return ongs.map(ong => this.toResponseObject(ong));
  }

  async getById(id: string): Promise<OngVO> {
    const ong = await this.ongRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    this.checkIfExists(ong);

    return this.toResponseObject(ong);
  }

  async create(userId: string, data: OngDTO) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const ong = this.ongRepository.create({ ...data, creator: user });
    await this.ongRepository.save(ong);
    return this.toResponseObject(ong);
  }

  async update(userId: string, id: string, data: Partial<OngDTO>) {
    const ong = await this.ongRepository.findOne({
      where: {
        id,
      },
      relations: ['creator'],
    });

    this.checkIfExists(ong);
    this.checkOwnership(ong, userId);

    await this.ongRepository.update({ id }, data);
    return await this.ongRepository.findOne({ id });
  }

  async delete(userId: string, id: string) {
    const ong = await this.ongRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    this.checkIfExists(ong);
    this.checkOwnership(ong, userId);

    await this.ongRepository.delete({ id });
    return ong;
  }
}
