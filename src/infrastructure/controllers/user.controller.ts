import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import UserCommand from '../../application/commands/user.command';
import CreateUserUseCase from '../../application/usecases/users/createUser.usecase';
import GetAllUsersUseCase from '../../application/usecases/users/getAllUsers.usecase';
import GetUserUseCase from '../../application/usecases/users/getUser.usecase';
import UpdateUserUseCase from '../../application/usecases/users/updateUser.usecase';
import DeleteUserUseCase from '../../application/usecases/users/deleteUser.usecase';
import { StorageService } from '../providers/storage.service';

@Controller('users')
export default class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    cmd: UserCommand,
    @Res() res: Response,
  ) {
    try {
      if (file) {
        cmd.imagen = await this.storageService.uploadFile(file);
      } else {
        cmd.imagen = null;
      }
      const optionalUser = await this.createUser.handler(cmd);
      const result = optionalUser.orElse(undefined);

      // Obtener imagen prefirmada
      if (result && result.getImagen()) {
        result.setImagen(
          await this.storageService.getSignedUrl(result.getImagen()),
        );
      }

      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error creating user',
        error: error.message,
      });
    }
  }

  @Put(':curp')
  @UseInterceptors(FileInterceptor('imagen'))
  async update(
    @Param('curp') curp: string,
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    cmd: UserCommand,
    @Res() res: Response,
  ) {
    try {
      if (file) {
        cmd.imagen = await this.storageService.uploadFile(file);
      }
      const optionalUser = await this.updateUser.handler(curp, cmd);
      const result = optionalUser.orElse(undefined);

      // Obtener imagen prefirmada
      if (result && result.getImagen()) {
        result.setImagen(
          await this.storageService.getSignedUrl(result.getImagen()),
        );
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error updating user',
        error: error.message,
      });
    }
  }

  @Get()
  async findAll(@Res() res: Response): Promise<any> {
    try {
      const users = await this.getAllUsers.handler();
      await Promise.all(
        users.map(async (user) => {
          if (user.getImagen()) {
            user.setImagen(
              await this.storageService.getSignedUrl(user.getImagen()),
            );
          }
        }),
      );
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting users',
        error: error.message,
      });
    }
  }

  @Get(':curp')
  async findOne(
    @Param('curp') curp: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const optionalUser = await this.getUser.handler(curp);
      const user = optionalUser.orElse(undefined);
      if (user && user.getImagen()) {
        user.setImagen(
          await this.storageService.getSignedUrl(user.getImagen()),
        );
      }
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting user',
        error: error.message,
      });
    }
  }

  @Delete(':curp')
  async delete(
    @Param('curp') curp: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const result = await this.deleteUser.handler(curp);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error deleting user',
        error: error.message,
      });
    }
  }
}
