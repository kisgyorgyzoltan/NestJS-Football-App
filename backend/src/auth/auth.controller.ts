import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SigninUserDto } from 'src/users/dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() signInUserDto: SigninUserDto) {
    return this.authService.login(signInUserDto);
  }

  @Post('register')
  @Public()
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
