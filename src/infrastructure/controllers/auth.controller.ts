// src/infrastructure/controllers/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import LoginCommand from '../../application/commands/login.command';
import LoginUseCase from '../../application/usecases/auth/login.usecase';
import { TwoFactorAuthProvider } from '../../domain/ports/two-factor-auth.provider';
import { TempTokenGuard } from '../auth/temp-token.guard';
import { UserRepository } from '../../domain/ports/user.repository';
import { StorageService } from '../providers/storage.service';
import UserCommand from 'src/application/commands/user.command';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import RegisterUseCase from '../../application/usecases/auth/register.usecase';

@Controller('auth')
export default class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly jwtService: JwtService,
    @Inject('TwoFactorAuthProvider')
    private readonly twoFactorAuth: TwoFactorAuthProvider,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly storageService: StorageService,
  ) {}

  /* --------- REGISTRO --------- */
  @Post('register')
  @UseInterceptors(FileInterceptor('imagen'))
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    cmd: UserCommand,
    @Res() res: Response,
  ) {
    try {
      /* Subir imagen (si viene) */
      if (file) {
        cmd.imagen = await this.storageService.uploadFile(file);
      }

      const result = await this.registerUseCase.handler(cmd);

      if (!result.isPresent()) {
        return res.status(400).json({
          message: 'No se pudo crear el usuario. Verifica los datos.',
          statusCode: 400,
        });
      }

      const user = result.get();
      if (user.getImagen()) {
        user.setImagen(
          await this.storageService.getSignedUrl(user.getImagen()),
        );
      }

      return res.status(HttpStatus.CREATED).json({
        message: 'Registro exitoso',
        data: user,
      });
    } catch (e) {
      /* ------------ ERRORES DE NEGOCIO -------------- */
      if (e.name === 'DuplicatedUserException')
        return res.status(409).json({ message: e.message, statusCode: 409 });
      if (e.name === 'UserDomainException')
        return res.status(400).json({ message: e.message, statusCode: 400 });

      /* ------------ VALIDACIÓN ---------------------- */
      if (e.status === 400)
        return res.status(400).json({ message: e.message, statusCode: 400 });

      /* ------------ FALLO DESCONOCIDO --------------- */
      console.error('Error en /auth/register:', e);
      return res.status(500).json({
        message: e.message || 'Error interno al registrar usuario',
        statusCode: 500,
      });
    }
  }

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

      // Obtener imagen firmada si existe
      let imagenUrl: string | null = null;
      if (loginResponse.user?.imagen) {
        imagenUrl = await this.storageService.getSignedUrl(
          loginResponse.user.imagen,
        );
      }

      const responseWithImagen = {
        ...loginResponse,
        user: {
          ...loginResponse.user,
          imagen: imagenUrl ?? null,
        },
      };

      return res.status(HttpStatus.OK).json({
        message: loginResponse.requires2fa
          ? 'Se requiere autenticación de dos factores'
          : 'Login exitoso',
        data: responseWithImagen,
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
  @UseGuards(TempTokenGuard)
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

      if (!req.user.requires2fa) {
        throw new BadRequestException('Token inválido para completar 2FA');
      }

      const isValid = await this.twoFactorAuth.verifyCode(userId, body.code);

      if (!isValid) {
        throw new UnauthorizedException('Código de autenticación inválido');
      }

      const userOptional = await this.userRepository.findById(userId);
      const user = userOptional.orElse(undefined);

      let imagenUrl: string | undefined;
      if (user?.getImagen()) {
        imagenUrl = await this.storageService.getSignedUrl(user.getImagen());
      }

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
            imagen: imagenUrl ?? null,
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
