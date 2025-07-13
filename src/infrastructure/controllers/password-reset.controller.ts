// src/infrastructure/controllers/password-reset.controller.ts
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PasswordResetUseCase } from '../../application/usecases/auth/password-reset.usecase';
import {
  RequestPasswordResetCommand,
  ConfirmPasswordResetCommand,
} from '../../application/commands/password-reset.command';

@Controller('auth')
export default class PasswordResetController {
  constructor(private readonly passwordResetUseCase: PasswordResetUseCase) {}

  @Post('request-password-reset')
  async requestReset(@Body() body: { email: string }) {
    try {
      if (!body?.email) {
        throw new BadRequestException('El email es requerido');
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        throw new BadRequestException('El formato del email es inválido');
      }

      const command = new RequestPasswordResetCommand();
      command.email = body.email.trim().toLowerCase();

      const result = await this.passwordResetUseCase.requestReset(command);

      if (!result.isPresent()) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return {
        success: true,
        message: 'Si el email existe, se ha enviado un código de recuperación',
      };
    } catch (error) {
      console.error('Error en request password reset:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno al procesar la solicitud de restablecimiento de contraseña',
      );
    }
  }

  @Post('confirm-password-reset')
  async confirmReset(
    @Body() body: { email: string; code: string; newPassword: string },
  ) {
    try {
      if (!body?.email || !body?.code || !body?.newPassword) {
        throw new BadRequestException(
          'Todos los campos son requeridos (email, code, newPassword)',
        );
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        throw new BadRequestException('El formato del email es inválido');
      }

      // Validar longitud mínima de contraseña
      if (body.newPassword.length < 6) {
        throw new BadRequestException(
          'La contraseña debe tener al menos 6 caracteres',
        );
      }

      const command = new ConfirmPasswordResetCommand();
      command.email = body.email.trim().toLowerCase();
      command.code = body.code.trim().toUpperCase();
      command.newPassword = body.newPassword;

      const result = await this.passwordResetUseCase.confirmReset(command);

      if (!result.isPresent()) {
        throw new BadRequestException('Código inválido o expirado');
      }

      return {
        success: true,
        message: 'Contraseña actualizada correctamente',
      };
    } catch (error) {
      console.error('Error en confirm password reset:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno al confirmar el restablecimiento de contraseña',
      );
    }
  }
}
