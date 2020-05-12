import { IsNotEmpty } from 'class-validator';

export class UserLoginDTO {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class UserRegisterDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class UserVO {
  id?: string;
  username: string;
  email: string;
  created: Date;
  token?: string;
}
