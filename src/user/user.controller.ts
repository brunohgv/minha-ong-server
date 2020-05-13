import { Controller, Post, Get, Body, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { UserLoginDTO, UserRegisterDTO } from './user.dto';
import { ValidationPipe } from '../shared/validation.pipe';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/api/users')
  getAllUsers() {
    return this.userService.getAll();
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  signIn(@Body() data: UserLoginDTO) {
    return this.userService.login(data);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  register(@Body() data: UserRegisterDTO) {
    return this.userService.register(data);
  }
}
