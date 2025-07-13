// src/infrastructure/controllers/two-factor-auth.controller.ts
import {
  Controller,
  Post,
  Res,
  UseGuards,
  Body,
  Req,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TwoFactorAuthProvider } from '../../domain/ports/two-factor-auth.provider';
import { UserRepository } from '../../domain/ports/user.repository';

@Controller('2fa')
export default class TwoFactorAuthController {
  constructor(
    @Inject('TwoFactorAuthProvider')
    private readonly twoFactorAuth: TwoFactorAuthProvider,
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  @Post('setup')
  @UseGuards(JwtAuthGuard)
  async setup(@Req() req: any, @Res() res: Response) {
    try {
      // Verificar autenticación
      if (!req.user) {
        throw new UnauthorizedException('Token de autenticación requerido');
      }

      const userId = req.user?.userId;
      let userEmail = req.user.email;

      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token',
        );
      }

      // Si el email no está en el token, obténlo de la base de datos
      if (!userEmail) {
        const userOptional = await this.userRepository.findByCurp(userId);
        if (!userOptional.isPresent()) {
          throw new NotFoundException('Usuario no encontrado');
        }
        userEmail = userOptional.get().getEmail();
      }

      const { otpAuthUrl } = await this.twoFactorAuth.generateSecret(
        userId,
        userEmail,
      );

      res.setHeader('content-type', 'image/png');
      return this.twoFactorAuth.generateQrCode(res, otpAuthUrl);
    } catch (error) {
      console.error('Error detallado en setup 2FA:', error);
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno al generar el código QR de 2FA',
      );
    }
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  async enable(@Req() req: any, @Body() body: { code: string }) {
    try {
      // Verificar autenticación
      if (!req.user) {
        throw new UnauthorizedException('Token de autenticación requerido');
      }

      if (!body?.code) {
        throw new BadRequestException('El código 2FA es requerido');
      }

      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token',
        );
      }

      const isValid = await this.twoFactorAuth.verifyCode(userId, body.code);

      if (!isValid) {
        throw new UnauthorizedException('Código de autenticación inválido');
      }

      const userOptional = await this.userRepository.findById(userId);
      if (!userOptional.isPresent()) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const user = userOptional.get();
      (user as any).isTwoFactorEnable = true;
      await this.userRepository.update(user.getCurp(), user);

      return {
        success: true,
        message: 'Autenticación de dos factores habilitada correctamente',
      };
    } catch (error) {
      console.error('Error en enable 2FA:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno al habilitar la autenticación de dos factores',
      );
    }
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Req() req: any, @Body() body: { code: string }) {
    try {
      // Verificar autenticación
      if (!req.user) {
        throw new UnauthorizedException('Token de autenticación requerido');
      }

      if (!body?.code) {
        throw new BadRequestException('El código 2FA es requerido');
      }

      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token',
        );
      }

      const isValid = await this.twoFactorAuth.verifyCode(userId, body.code);

      if (!isValid) {
        throw new UnauthorizedException('Código de autenticación inválido');
      }

      return {
        success: true,
        message: 'Código de autenticación válido',
      };
    } catch (error) {
      console.error('Error en verify 2FA:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno al verificar el código de autenticación',
      );
    }
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async disable(@Req() req: any) {
    try {
      // Verificar autenticación
      if (!req.user) {
        throw new UnauthorizedException('Token de autenticación requerido');
      }

      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token',
        );
      }

      const userOptional = await this.userRepository.findByCurp(userId);
      if (!userOptional.isPresent()) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const user = userOptional.get();
      (user as any).isTwoFactorEnable = false;
      (user as any).twoFactorAuthSecret = null;
      await this.userRepository.update(user.getCurp(), user);

      return {
        success: true,
        message: 'Autenticación de dos factores deshabilitada correctamente',
      };
    } catch (error) {
      console.error('Error en disable 2FA:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno al deshabilitar la autenticación de dos factores',
      );
    }
  }
}
