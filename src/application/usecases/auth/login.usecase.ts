// src/application/usecases/auth/login.usecase.ts
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Optional } from 'typescript-optional';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../domain/ports/user.repository';
import LoginCommand from '../../commands/login.command';
import { TwoFactorAuthProvider } from '../../../domain/ports/two-factor-auth.provider';

export interface LoginResponse {
  access_token?: string;
  temp_token?: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    role: string;
    curp: string;
    imagen?: string;
    isTwoFactorEnable: boolean;
  };
  requires2fa?: boolean;
}

@Injectable()
export default class LoginUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private jwtService: JwtService,
    @Inject('TwoFactorAuthProvider')
    private twoFactorAuth: TwoFactorAuthProvider,
  ) {}

  public async handler(
    loginCommand: LoginCommand,
  ): Promise<Optional<LoginResponse>> {
    const userOptional = await this.userRepository.findByEmail(
      loginCommand.email,
    );

    if (!userOptional.isPresent()) {
      return Optional.empty();
    }

    const user = userOptional.get();
    const isValidPassword = await bcrypt.compare(
      loginCommand.password,
      user['password'],
    );

    if (!isValidPassword || !user['active']) {
      return Optional.empty();
    }

    // Manejo de 2FA
    if (user['isTwoFactorEnable']) {
      if (!loginCommand.twoFactorCode) {
        // Usuario necesita proporcionar código 2FA
        const tempToken = this.jwtService.sign(
          {
            sub: user.getId(),
            userId: user.getId(),
            email: user.getEmail(),
            role: user['role'],
            curp: user.getCurp(),
            requires2fa: true,
          },
          { expiresIn: '10m' }, // Token temporal más corto
        );

        return Optional.of({
          temp_token: tempToken,
          user: this.mapUserResponse(user),
          requires2fa: true,
        });
      } else {
        // Verificar código 2FA
        const is2FAValid = await this.twoFactorAuth.verifyCode(
          user.getId(),
          loginCommand.twoFactorCode,
        );

        if (!is2FAValid) {
          return Optional.empty();
        }
      }
    }

    // Login exitoso (con o sin 2FA)
    const payload = {
      sub: user.getId(),
      userId: user.getId(),
      email: user.getEmail(),
      role: user['role'],
      curp: user.getCurp(),
      isTwoFactorAuthenticated: user['isTwoFactorEnable'],
    };

    return Optional.of({
      access_token: this.jwtService.sign(payload),
      user: this.mapUserResponse(user),
    });
  }

  private mapUserResponse(user: any): LoginResponse['user'] {
    return {
      id: user.getId(),
      nombre: user.getNombre(),
      email: user.getEmail(),
      role: user['role'],
      curp: user.getCurp(),
      imagen: user.getImagen(),
      isTwoFactorEnable: user['isTwoFactorEnable'],
    };
  }
}
