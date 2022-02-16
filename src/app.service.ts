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

  async signup(user: User): Promise<any> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(user.password, salt);

      const reqBody = {
        fullname: user.fullname,
        email: user.email,
        password: hash,
        authConfirmToken: this.code,
      };
      const newUser = await this.userRepository.insert(reqBody);
      await this.sendConfirmationEmail(newUser);

      return true;
    } catch (error) {
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signin(user: User, jwt = JwtService): Promise<any> {
    try {
      const foundUser = await this.userRepository.findOne({
        email: user.email,
      });

      if (foundUser) {
        if (foundUser.isVerified) {
          const isMatch = await bcrypt.compare(
            user.password,
            foundUser.password,
          );

          if (isMatch) {
            const payload = { email: foundUser.email };

            return {
              token: jwt.sign(payload),
            };
          }
        } else {
          return new HttpException(
            'Pls verify your account',
            HttpStatus.UNAUTHORIZED,
          );
        }

        return new HttpException(
          'Incorrect username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return new HttpException(
        'Incorrect username or password',
        HttpStatus.UNAUTHORIZED,
      );
    } catch (error) {
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyAccount(code: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        authConfirmToken: code,
      });

      if (!user) {
        return new HttpException(
          'The code is invalid or expired',
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.userRepository.update(
        { authConfirmToken: user.authConfirmToken },
        { isVerified: true, authConfirmToken: undefined },
      );
      await this.sendConfirmedEmail(user);

      return true;
    } catch (error) {
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
