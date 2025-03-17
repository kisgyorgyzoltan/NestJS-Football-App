import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SigninUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  password: string;
}
