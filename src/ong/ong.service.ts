import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OngEntity } from './ong.entity';
import { OngDTO } from './ong.dto';

@Injectable()
export class OngService {
  constructor(
    @InjectRepository(OngEntity) private ongRepository: Repository<OngEntity>,
  ) {}

  async getAll() {
    return await this.ongRepository.find();
  }

  async getById(id: string) {
    const ong = await this.ongRepository.findOne({ id });
    if (!ong) {
      throw new HttpException(
        'There is no Ong with this ID',
        HttpStatus.NOT_FOUND,
      );
    }
    return ong;
  }

  async create(data: OngDTO) {
    const ong = await this.ongRepository.create(data);
    await this.ongRepository.save(ong);
    return ong;
  }

  async update(id: string, data: Partial<OngDTO>) {
    const ong = await this.ongRepository.findOne({ id });
    if (!ong) {
      throw new HttpException(
        'There is no Ong with this ID',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.ongRepository.update({ id }, data);
    return await this.ongRepository.findOne({ id });
  }

  async delete(id: string) {
    const ong = await this.ongRepository.findOne({ id });
    if (!ong) {
      throw new HttpException(
        'There is no Ong with this ID',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.ongRepository.delete({ id });
    return ong;
  }
}
