import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import LoginCommand from '../../application/commands/login.command';
import LoginUseCase from '../../application/usecases/auth/login.usecase';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Body(new ValidationPipe({ transform: true })) loginCommand: LoginCommand,
    @Res() res: Response,
  ) {
    try {
      const result = await this.loginUseCase.handler(loginCommand);

      if (!result.isPresent()) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Credenciales inválidas',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }

      const loginResponse = result.get();
      return res.status(HttpStatus.OK).json({
        message: 'Login exitoso',
        data: loginResponse,
      });
    } catch {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error interno del servidor',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Post('validate')
  async validateToken(@Body('token') token: string, @Res() res: Response) {
    try {
      // Verifica y decodifica el JWT
      const payload = this.jwtService.verify<{ sub: string; role: string }>(
        token,
      );

      return res.status(HttpStatus.OK).json({
        id: payload.sub,
        role: payload.role,
      });
    } catch {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Token inválido',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
  }
}
