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
    const existingUserOpt = await this.userRepository.findByCurp(curp);

    if (!existingUserOpt.isPresent()) {
      return Optional.empty<User>();
    }

    const existingUser = existingUserOpt.get();

    // Si no se envió isTwoFactorEnable, mantenemos el valor actual
    if (userCommand.isTwoFactorEnable === undefined) {
      userCommand.isTwoFactorEnable = existingUser['isTwoFactorEnable'];
    }

    // Similarmente puedes hacer esto para otros campos si deseas conservar valores no enviados

    const user = await this.userFactory.createUser(userCommand);
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
