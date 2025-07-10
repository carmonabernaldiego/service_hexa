import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Optional } from 'typescript-optional';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../domain/ports/user.repository';
import LoginCommand from '../../commands/login.command';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    role: string;
    curp: string;
  };
}

@Injectable()
export default class LoginUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  public async handler(
    loginCommand: LoginCommand,
  ): Promise<Optional<LoginResponse>> {
    // Buscar usuario por email
    const userOptional = await this.userRepository.findByEmail(
      loginCommand.email,
    );

    if (!userOptional.isPresent()) {
      return Optional.empty();
    }

    const user = userOptional.get();

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(
      loginCommand.password,
      user['password'],
    );

    if (!isValidPassword) {
      return Optional.empty();
    }

    // Verificar que el usuario esté activo
    if (!user['active']) {
      return Optional.empty();
    }

    // Generar JWT
    const payload = {
      sub: user.getId(),
      email: user.getEmail(),
      role: user['role'],
      curp: user.getCurp(),
    };

    const access_token = this.jwtService.sign(payload);

    const response: LoginResponse = {
      access_token,
      user: {
        id: user.getId(),
        nombre: user.getNombre(),
        email: user.getEmail(),
        role: user['role'],
        curp: user.getCurp(),
      },
    };

    return Optional.of(response);
  }
}
