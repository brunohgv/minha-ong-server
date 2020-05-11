import { IsString, IsInt, Min, Max } from 'class-validator';

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
