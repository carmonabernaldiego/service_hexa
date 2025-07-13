import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import User from '../../domain/models/users.model';
import UserCommand from '../commands/user.command';

@Injectable()
export default class UserFactory {
  public async createUser(userCommand: UserCommand): Promise<User> {
    const hashedPassword = await bcrypt.hash(userCommand.password, 10);

    return new User(
      '',
      userCommand.nombre,
      userCommand.apellidoPaterno,
      userCommand.apellidoMaterno,
      userCommand.curp,
      userCommand.imagen,
      userCommand.email,
      hashedPassword,
      userCommand.twoFactorAuthSecret,
      userCommand.isTwoFactorEnable ?? false,
      userCommand.role ?? 'paciente',
      userCommand.active ?? true,
      userCommand.passwordResetCode ?? null,
      // NUEVOS CAMPOS
      userCommand.rfc,
      userCommand.fechaNacimiento,
      userCommand.cedulaProfesional,
      userCommand.telefono,
      userCommand.domicilio,
      userCommand.permisosPrescripcion,
      userCommand.declaracionTerminos,
    );
  }
}
