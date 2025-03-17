import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/user.entity';
import { SigninUserDto } from 'src/users/dto/signin-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(signInUserDto: SigninUserDto) {
    const user = await this.usersService.findOne(signInUserDto.username);
    if (!user) {
      Logger.error('User not found');
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(signInUserDto.password, user.password);

    if (isMatch) {
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    Logger.error('Password mismatch');
    throw new UnauthorizedException();
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword: string = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const newUser = new User();
    newUser.username = createUserDto.username;
    newUser.password = hashedPassword;
    newUser.role = 'user';

    const createdUser: User = await this.usersService.create(newUser);
    return {
      username: createdUser.username,
      role: createdUser.role,
    };
  }
}
