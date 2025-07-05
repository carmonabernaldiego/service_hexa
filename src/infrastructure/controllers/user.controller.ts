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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  // CREAR USUARIO (con imagen)
  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res,
  ) {
    const cmd = new UserCommand();
    Object.assign(cmd, body);
    if (file) {
      const key = await this.storageService.uploadFile(file);
      cmd.imagen = key;
    } else {
      cmd.imagen = null;
    }
    const result = await this.createUser.handler(cmd);
    return res.status(HttpStatus.CREATED).json(result);
  }

  // EDITAR USUARIO (con imagen)
  @Put(':curp')
  @UseInterceptors(FileInterceptor('imagen'))
  async update(
    @Param('curp') curp: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res,
  ) {
    const cmd = new UserCommand();
    Object.assign(cmd, body);
    if (file) {
      const key = await this.storageService.uploadFile(file);
      cmd.imagen = key;
    }
    const result = await this.updateUser.handler(curp, cmd);
    return res.status(HttpStatus.OK).json(result);
  }

  // OBTENER TODOS LOS USUARIOS (con url firmada)
  @Get()
  async findAll(@Res() res): Promise<any> {
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
  }

  @Get(':curp')
  async findOne(@Param('curp') curp: string, @Res() res): Promise<any> {
    const optionalUser = await this.getUser.handler(curp);
    const user = optionalUser.orElse(undefined);
    if (user && user.getImagen()) {
      user.setImagen(await this.storageService.getSignedUrl(user.getImagen()));
    }
    return res.status(HttpStatus.OK).json(user);
  }

  // ELIMINAR USUARIO
  @Delete(':curp')
  async delete(@Param('curp') curp: string, @Res() res): Promise<any> {
    const result = await this.deleteUser.handler(curp);
    return res.status(HttpStatus.OK).json(result);
  }
}
