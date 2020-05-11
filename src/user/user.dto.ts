import { IsNotEmpty } from 'class-validator';

export class UserLoginDTO {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class UserDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}
