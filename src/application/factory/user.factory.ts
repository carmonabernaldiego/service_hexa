import { Injectable } from '@nestjs/common';
import User from '../../domain/models/users.model';
import UserCommand from '../commands/user.command';

@Injectable()
export default class UserFactory {
  public createUser(userCommand: UserCommand): User {
    return new User(
      '',
      userCommand.nombre,
      userCommand.apellidoPaterno,
      userCommand.apellidoMaterno,
      userCommand.curp,
      userCommand.imagen,
      userCommand.email,
      userCommand.password,
      userCommand.twoFactorAuthSecret,
      userCommand.isTwoFactorEnable ?? false,
      userCommand.role ?? 'user',
      userCommand.active ?? true,
      userCommand.passwordResetCode ?? null,
    );
  }
}
