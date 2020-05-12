import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserLoginDTO, UserRegisterDTO, UserVO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getAll(): Promise<UserVO[]> {
    const users = await this.userRepository.find({ relations: ['ongs'] });
    return users.map(user => user.toResponseObject());
  }

  async login(data: UserLoginDTO): Promise<UserVO> {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException(
        'There is no registered user with this email',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!(await user.comparePassword(password))) {
      throw new HttpException('Invalid Password', HttpStatus.UNAUTHORIZED);
    }

    return user.toResponseObject(true);
  }

  async register(data: UserRegisterDTO): Promise<UserVO> {
    const { email, username } = data;

    let user = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (user && user.email === email) {
      throw new HttpException(
        'The informed email is already registered',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user && user.username === username) {
      throw new HttpException(
        'The informed username is already registered',
        HttpStatus.BAD_REQUEST,
      );
    }

    user = await this.userRepository.create(data);
    await this.userRepository.save(user);
    const savedUser = await this.userRepository.findOne({ where: { email } });

    return savedUser.toResponseObject(true);
  }
}
