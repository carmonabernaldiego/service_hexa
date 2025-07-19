import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';
import UserCommand from '../../commands/user.command';
import UserFactory from '../../factory/user.factory';
import { NotificationService } from '../../../infrastructure/providers/notification.service';
import UserDomainException from 'src/domain/exceptions/user-domain.exception';

@Injectable()
export default class CreateUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private userFactory: UserFactory,
    private notificationService: NotificationService,
  ) {}

  public async handler(userCommand: UserCommand): Promise<Optional<User>> {
    if (userCommand.role === 'farmacia') {
      if (!userCommand.rfc) {
        throw new UserDomainException('El RFC es obligatorio para farmacias');
      }
      userCommand.apellidoPaterno ??= '';
      userCommand.apellidoMaterno ??= '';
      userCommand.curp = userCommand.rfc;
    }

    const user = await this.userFactory.createUser(userCommand);
    const createdUser = await this.userRepository.create(user);

    if (createdUser.isPresent()) {
      const u = createdUser.get();

      // Enviar notificación de usuario creado
      try {
        await this.notificationService.sendUserCreatedNotification(
          u.getEmail(),
          u.getNombre(),
        );
      } catch (error) {
        console.error('Error sending notification:', error);
        // No falla la creación del usuario si falla la notificación
      }
    }

    return createdUser;
  }
}
