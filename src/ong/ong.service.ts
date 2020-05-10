import { Injectable } from '@nestjs/common';
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
    return await this.ongRepository.find({ where: { id } });
  }

  async create(data: OngDTO) {
    const ong = await this.ongRepository.create(data);
    await this.ongRepository.save(ong);
    return ong;
  }

  async update(id: string, data: Partial<OngDTO>) {
    await this.ongRepository.update({ id }, data);
    return await this.ongRepository.findOne({ id });
  }

  async delete(id: string) {
    await this.ongRepository.delete({ id });
    return { deleted: true };
  }
}
