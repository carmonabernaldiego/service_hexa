import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import LoginCommand from '../../application/commands/login.command';
import LoginUseCase from '../../application/usecases/auth/login.usecase';

@Controller('auth')
export default class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  async login(@Body() loginCommand: LoginCommand, @Res() res: Response) {
    try {
      const result = await this.loginUseCase.handler(loginCommand);

      if (!result.isPresent()) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const loginResponse = result.get();

      return res.status(HttpStatus.OK).json({
        message: 'Login exitoso',
        data: loginResponse,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Credenciales inválidas',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error interno del servidor',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
