import { IsString, IsInt, Min, Max } from 'class-validator';
import { UserVO } from '../user/user.dto';

export class OngDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(0)
  @Max(new Date().getFullYear())
  createdYear: number;
}

export class OngVO {
  id?: string;
  name: string;
  description: string;
  createdYear: number;
  created: Date;
  updated: Date;
  creator: UserVO;
}
