import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from './app.entity';

@Injectable()
export class AppService {
  private code;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: MailerService,
  ) {
    this.code = Math.floor(10000 + Math.random() * 90000);
  }

  async sendConfirmationEmail(user: any) {
    const { email, fullname } = user;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Please confirm your email',
      template: 'confirm',
      context: { fullname, code: this.code },
    });
  }

  async sendConfirmedEmail(user: User) {
    const { email, fullname } = user;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your email has been confirmed',
      template: 'confirmed',
      context: { email, fullname },
    });
  }
}
