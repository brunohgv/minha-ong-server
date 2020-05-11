import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { response } from 'express';

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

  @BeforeInsert()
  hashPassword() {
    console.log(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! TRIGGERED',
    );
    this.password = bcrypt.hashSync(this.password, 10);
  }

  toResponseObject(showToken = true) {
    const { id, created, username, email, token } = this;
    const responseObject = { id, created, username, email, token };
    if (!showToken) {
      delete responseObject.token;
    }
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
