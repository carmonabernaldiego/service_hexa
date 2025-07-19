import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import { UserRepository } from '../../../domain/ports/user.repository';
import UserCommand from '../../commands/user.command';
import UserFactory from '../../factory/user.factory';
import DuplicatedUserException from '../../../domain/exceptions/duplicated-user.exception';
import { NotificationService } from '../../../infrastructure/providers/notification.service';
import User from '../../../domain/models/users.model';

@Injectable()
export default class RegisterUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private userFactory: UserFactory,
    private notification: NotificationService,
  ) {}

  public async handler(cmd: UserCommand): Promise<Optional<User>> {
    /* ---------- Reglas especiales ---------- */
    if (cmd.role === 'farmacia') {
      if (!cmd.rfc) {
        throw new Error('El campo RFC es obligatorio para farmacias');
      }
      cmd.apellidoPaterno = cmd.apellidoPaterno ?? '';
      cmd.apellidoMaterno = cmd.apellidoMaterno ?? '';
      cmd.curp = cmd.rfc; // RFC se usa como CURP en BD
    }

    /* ---------- Crear usuario ---------- */
    try {
      const user = await this.userFactory.createUser(cmd);
      const created = await this.userRepository.create(user);

      if (created.isPresent()) {
        const u = created.get();
        // notificación de bienvenida
        await this.notification.sendUserCreatedNotification(
          u.getEmail(),
          u.getNombre(),
        );
      }
      return created;
    } catch (e) {
      // Propaga excepciones conocidas para que el controller decida el HTTP
      if (
        e instanceof DuplicatedUserException ||
        e.name === 'UserDomainException'
      ) {
        throw e;
      }
      throw new Error(e.message);
    }
  }
}
