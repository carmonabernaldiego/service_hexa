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
} from '@nestjs/common';
import UserCommand from '../../application/commands/user.command';
import CreateUserUseCase from '../../application/usecases/users/createUser.usecase';
import GetAllUsersUseCase from '../../application/usecases/users/getAllUsers.usecase';
import GetUserUseCase from '../../application/usecases/users/getUser.usecase';
import UpdateUserUseCase from '../../application/usecases/users/updateUser.usecase';
import DeleteUserUseCase from '../../application/usecases/users/deleteUser.usecase';

@Controller('users')
export default class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Get()
  async findAll(@Res() res): Promise<any> {
    const users = await this.getAllUsers.handler();
    return res.status(HttpStatus.OK).json(users);
  }

  @Get(':curp')
  async findOne(@Param('curp') curp: string, @Res() res): Promise<any> {
    const user = await this.getUser.handler(curp);
    return res.status(HttpStatus.OK).json(user);
  }

  @Post()
  async create(@Body() cmd: UserCommand, @Res() res): Promise<any> {
    const result = await this.createUser.handler(cmd);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Put(':curp')
  async update(
    @Param('curp') curp: string,
    @Body() cmd: UserCommand,
    @Res() res,
  ): Promise<any> {
    const result = await this.updateUser.handler(curp, cmd);
    return res.status(HttpStatus.OK).json(result);
  }

  @Delete(':curp')
  async delete(@Param('curp') curp: string, @Res() res): Promise<any> {
    const result = await this.deleteUser.handler(curp);
    return res.status(HttpStatus.OK).json(result);
  }
}
