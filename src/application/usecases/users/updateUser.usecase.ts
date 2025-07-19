import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';
import UserCommand from '../../commands/user.command';
import UserFactory from '../../factory/user.factory';
import { NotificationService } from '../../../infrastructure/providers/notification.service';
import UserDomainException from 'src/domain/exceptions/user-domain.exception';

@Injectable()
export default class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private userFactory: UserFactory,
    private notificationService: NotificationService,
  ) {}

  public async handler(
    curp: string,
    cmd: UserCommand,
  ): Promise<Optional<User>> {
    /* ---------- usuario actual ---------- */
    const existingOpt = await this.userRepository.findByCurp(curp);
    if (!existingOpt.isPresent()) return Optional.empty<User>();

    const existing = existingOpt.get();

    /* ---------- Conservar valores NO enviados ---------- */
    cmd.role = cmd.role ?? existing['role'];
    cmd.isTwoFactorEnable =
      cmd.isTwoFactorEnable !== undefined
        ? cmd.isTwoFactorEnable
        : existing['isTwoFactorEnable'];

    /* ---------- Reglas de FARMACIA ---------- */
    if (cmd.role === 'farmacia') {
      cmd.apellidoPaterno = cmd.apellidoPaterno ?? '';
      cmd.apellidoMaterno = cmd.apellidoMaterno ?? '';
      if (!cmd.rfc && !existing.getRfc())
        throw new UserDomainException('El RFC es obligatorio para farmacias');
      cmd.curp = (cmd.rfc ?? existing.getRfc()) as string;
    }

    /* ---------- Crear dominio modificado ---------- */
    const user = await this.userFactory.createUser({ ...existing, ...cmd });
    const updated = await this.userRepository.update(curp, user);

    if (updated.isPresent()) {
      const u = updated.get();
      try {
        await this.notificationService.sendUserUpdatedNotification(
          u.getEmail(),
          u.getNombre(),
        );
      } catch (err) {
        console.error('Error sending notification:', err);
      }
    }
    return updated;
  }
}
