// src/infrastructure/providers/two-factor-auth.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { TwoFactorAuthProvider } from '../../domain/ports/two-factor-auth.provider';
import { UserRepository } from '../../domain/ports/user.repository';
import { Optional } from 'typescript-optional';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../config/env.enum';

@Injectable()
export class TwoFactorAuthService implements TwoFactorAuthProvider {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async generateSecret(userId: string, email: string) {
    try {
      const secret = authenticator.generateSecret();
      const appName = this.configService.get<string>(
        Configuration.TWO_FACTOR_AUTH_APP_NAME,
        'RxCheck',
      );

      const otpAuthUrl = authenticator.keyuri(email, appName, secret);
      const userOptional = await this.userRepository.findById(userId);
      if (!userOptional.isPresent()) {
        throw new Error('Usuario no encontrado');
      }

      const user = userOptional.get();
      (user as any).twoFactorAuthSecret = secret;
      await this.userRepository.update(user.getCurp(), user);

      return { secret, otpAuthUrl };
    } catch (error) {
      console.error('Error en generateSecret:', error);
      throw new Error('Error al generar el secreto de 2FA');
    }
  }

  async generateQrCode(stream: Response, otpPathUrl: string) {
    try {
      return toFileStream(stream, otpPathUrl);
    } catch (error) {
      console.error('Error en generateQrCode:', error);
      throw new Error('Error al generar el código QR');
    }
  }

  async verifyCode(userId: string, code: string) {
    try {
      const userOptional = await this.userRepository.findById(userId);

      if (!userOptional.isPresent()) {
        console.error('Usuario no encontrado para verificación 2FA:', userId);
        return false;
      }

      const user = userOptional.get();
      const secret = user['twoFactorAuthSecret'];

      if (!secret) {
        console.error('Usuario no tiene secreto 2FA configurado:', userId);
        return false;
      }

      const isValid = authenticator.verify({
        token: code,
        secret: secret,
      });

      console.log('Verificación 2FA para usuario:', userId, 'válida:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error en verifyCode:', error);
      return false;
    }
  }
}
