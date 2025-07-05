import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';
import { NotificationService } from '../../../infrastructure/providers/notification.service';

@Injectable()
export default class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private notificationService: NotificationService,
  ) {}

  public async handler(curp: string): Promise<Optional<User>> {
    // Primero obtenemos el usuario para tener sus datos
    const existingUser = await this.userRepository.findByCurp(curp);

    if (!existingUser.isPresent()) {
      return Optional.empty();
    }

    const user = existingUser.get();
    const deletedUser = await this.userRepository.delete(curp);

    if (deletedUser.isPresent()) {
      // Enviar notificación de usuario eliminado
      try {
        await this.notificationService.sendUserDeletedNotification(
          user.getEmail(),
          user.getNombre(),
        );
      } catch (error) {
        console.error('Error sending notification:', error);
        // No falla la eliminación si falla la notificación
      }
    }

    return deletedUser;
  }
}
