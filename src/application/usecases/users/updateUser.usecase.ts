import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';
import UserCommand from '../../commands/user.command';
import UserFactory from '../../factory/user.factory';
import { NotificationService } from '../../../infrastructure/providers/notification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private userFactory: UserFactory,
    private notificationService: NotificationService,
  ) {}

  public async handler(
    curp: string,
    userCommand: UserCommand,
  ): Promise<Optional<User>> {
    const existingUserOpt = await this.userRepository.findByCurp(curp);
    if (!existingUserOpt.isPresent()) {
      return Optional.empty<User>();
    }
    const existingUser = existingUserOpt.get();

    // Rellenar campos opcionales con valores actuales si no vienen
    userCommand.nombre = userCommand.nombre ?? existingUser['nombre'];
    userCommand.apellidoPaterno =
      userCommand.apellidoPaterno ?? existingUser['apellidoPaterno'];
    userCommand.apellidoMaterno =
      userCommand.apellidoMaterno ?? existingUser['apellidoMaterno'];
    userCommand.curp = existingUser.getCurp(); // no se cambia curp
    userCommand.imagen = userCommand.imagen ?? existingUser.getImagen();
    userCommand.email = userCommand.email ?? existingUser.getEmail();
    userCommand.twoFactorAuthSecret =
      userCommand.twoFactorAuthSecret ?? existingUser['twoFactorAuthSecret'];
    userCommand.isTwoFactorEnable =
      userCommand.isTwoFactorEnable ?? existingUser['isTwoFactorEnable'];
    userCommand.role = userCommand.role ?? existingUser['role'];
    userCommand.active = userCommand.active ?? existingUser['active'];
    userCommand.passwordResetCode =
      userCommand.passwordResetCode ?? existingUser['passwordResetCode'];
    userCommand.rfc = userCommand.rfc ?? existingUser.getRfc();
    userCommand.fechaNacimiento =
      userCommand.fechaNacimiento ?? existingUser.getFechaNacimiento();
    userCommand.cedulaProfesional =
      userCommand.cedulaProfesional ?? existingUser.getCedulaProfesional();
    userCommand.telefono = userCommand.telefono ?? existingUser.getTelefono();
    userCommand.domicilio =
      userCommand.domicilio ?? existingUser.getDomicilio();
    userCommand.permisosPrescripcion =
      userCommand.permisosPrescripcion ??
      existingUser.getPermisosPrescripcion();
    userCommand.declaracionTerminos =
      userCommand.declaracionTerminos ?? existingUser.getDeclaracionTerminos();

    // Manejar password: si no hay password nuevo, usar el viejo sin rehashear
    let passwordFinal = existingUser['password'];
    if (
      userCommand.password &&
      userCommand.password !== existingUser['password']
    ) {
      // nuevo password -> hacer hash
      passwordFinal = await bcrypt.hash(userCommand.password, 10);
    }
    userCommand.password = passwordFinal;

    // Crear user usando UserFactory (que hace hash solo si password es texto)
    // Aquí le pasamos el password ya procesado
    const user = new User(
      existingUser.getId(),
      userCommand.nombre,
      userCommand.apellidoPaterno,
      userCommand.apellidoMaterno,
      userCommand.curp,
      userCommand.imagen,
      userCommand.email,
      userCommand.password, // ya tiene hash o password viejo
      userCommand.twoFactorAuthSecret,
      userCommand.isTwoFactorEnable,
      userCommand.role,
      userCommand.active,
      userCommand.passwordResetCode,
      userCommand.rfc,
      userCommand.fechaNacimiento,
      userCommand.cedulaProfesional,
      userCommand.telefono,
      userCommand.domicilio,
      userCommand.permisosPrescripcion,
      userCommand.declaracionTerminos,
    );

    const updatedUser = await this.userRepository.update(curp, user);

    if (updatedUser.isPresent()) {
      const u = updatedUser.get();
      try {
        await this.notificationService.sendUserUpdatedNotification(
          u.getEmail(),
          u.getNombre(),
        );
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }

    return updatedUser;
  }
}
