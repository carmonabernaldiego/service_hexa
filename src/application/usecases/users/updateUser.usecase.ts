import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';
import UserCommand from '../../commands/user.command';
import UserFactory from '../../factory/user.factory';
import { NotificationService } from '../../../infrastructure/providers/notification.service';

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
    const user = await this.userFactory.createUser(userCommand);
    const updatedUser = await this.userRepository.update(curp, user);

    if (updatedUser.isPresent()) {
      const u = updatedUser.get();

      // Enviar notificación de usuario actualizado
      try {
        await this.notificationService.sendUserUpdatedNotification(
          u.getEmail(),
          u.getNombre(),
        );
      } catch (error) {
        console.error('Error sending notification:', error);
        // No falla la actualización si falla la notificación
      }
    }

    return updatedUser;
  }
}
