// src/infrastructure/controllers/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  ValidationPipe,
  UseGuards,
  Req,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import LoginCommand from '../../application/commands/login.command';
import LoginUseCase from '../../application/usecases/auth/login.usecase';
import { TwoFactorAuthProvider } from '../../domain/ports/two-factor-auth.provider';
import { Inject } from '@nestjs/common';
import { TempTokenGuard } from '../auth/temp-token.guard';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
    @Inject('TwoFactorAuthProvider')
    private readonly twoFactorAuth: TwoFactorAuthProvider,
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

      // Respuesta diferenciada para 2FA
      if (loginResponse.requires2fa) {
        return res.status(HttpStatus.OK).json({
          message: 'Se requiere autenticación de dos factores',
          data: loginResponse,
        });
      }

      // Respuesta para login completo
      return res.status(HttpStatus.OK).json({
        message: 'Login exitoso',
        data: loginResponse,
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error interno del servidor',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Post('complete-2fa')
  @UseGuards(TempTokenGuard) // <-- Usa el nuevo guard
  async complete2FA(
    @Req() req: any,
    @Body() body: { code: string },
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('Token de autenticación requerido');
      }

      if (!body?.code) {
        throw new BadRequestException('El código 2FA es requerido');
      }

      const userId = req.user.userId;

      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token',
        );
      }

      console.error(req.user);
      // Verificar que el token es temporal (requires2fa)
      if (!req.user.requires2fa) {
        throw new BadRequestException('Token inválido para completar 2FA');
      }

      const isValid = await this.twoFactorAuth.verifyCode(userId, body.code);

      if (!isValid) {
        throw new UnauthorizedException('Código de autenticación inválido');
      }

      // Generar token final
      const payload = {
        sub: userId,
        userId: userId,
        email: req.user.email,
        role: req.user.role,
        curp: req.user.curp,
        isTwoFactorAuthenticated: true,
      };

      const access_token = this.jwtService.sign(payload);

      return res.status(HttpStatus.OK).json({
        message: 'Autenticación completada exitosamente',
        data: {
          access_token,
          user: {
            id: userId,
            email: req.user.email,
            role: req.user.role,
            curp: req.user.curp,
            isTwoFactorEnable: true,
          },
        },
      });
    } catch (error) {
      console.error('Error en complete 2FA:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        return res.status(error.getStatus()).json({
          message: error.message,
          statusCode: error.getStatus(),
        });
      }

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
