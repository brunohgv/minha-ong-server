import { IsNotEmpty, IsEmail } from 'class-validator';
import { OngEntity } from 'src/ong/ong.entity';

export class UserLoginDTO {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class UserRegisterDTO {
  @IsNotEmpty()
  username: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class UserVO {
  id: string;
  username: string;
  email: string;
  created: Date;
  token?: string;
  ongs?: OngEntity[];
}
