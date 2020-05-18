import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { OngEntity } from '../ong/ong.entity';
import { UserVO } from './user.dto';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column({ type: 'text', unique: true })
  username: string;

  @Column('text')
  password: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @OneToMany(
    type => OngEntity,
    ongs => ongs.creator,
  )
  ongs: OngEntity[];

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  toResponseObject(showToken = false): UserVO {
    const { id, created, username, email, token } = this;
    const responseObject = { id, created, username, email, token };

    if (!showToken) delete responseObject.token;

    return responseObject;
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  private get token() {
    const { id, username } = this;
    return jwt.sign({ id, username }, process.env.SECRET, { expiresIn: '7d' });
  }
}
