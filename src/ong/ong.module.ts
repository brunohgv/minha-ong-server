import { Module } from '@nestjs/common';
import { OngController } from './ong.controller';
import { OngService } from './ong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngEntity } from './ong.entity';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OngEntity, UserEntity])],
  controllers: [OngController],
  providers: [OngService],
})
export class OngModule {}
