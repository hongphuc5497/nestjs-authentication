import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './app.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {}

  @Get('/verify')
  @Render('verify')
  VerifyEmail() {}

  @Post('/verify')
  async Verify(@Body() body) {
    return await this.appService.verifyAccount(body.code);
  }

  @Post('/signin')
  async Signin(@Body() user: User) {
    return await this.appService.signin(user);
  }

  @Post('/signup')
  async Signup(@Body() user: User) {
    return await this.appService.signup(user);
  }
}
