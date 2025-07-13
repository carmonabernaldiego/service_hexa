import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../domain/ports/user.repository';
import {
  RequestPasswordResetCommand,
  ConfirmPasswordResetCommand,
} from '../../commands/password-reset.command';
import { NotificationService } from '../../../infrastructure/providers/notification.service';

@Injectable()
export class PasswordResetUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private notificationService: NotificationService,
  ) {}

  async requestReset(
    command: RequestPasswordResetCommand,
  ): Promise<Optional<{ success: boolean }>> {
    const userOptional = await this.userRepository.findByEmail(command.email);
    if (!userOptional.isPresent()) {
      return Optional.empty();
    }

    const user = userOptional.get();
    const code = this.generateResetCode();

    (user as any).passwordResetCode = code;
    await this.userRepository.update(user.getCurp(), user);

    await this.notificationService.sendPasswordResetNotification(
      user.getEmail(),
      user.getNombre(), // Asumiendo que tienes este método
      code,
    );

    return Optional.of({ success: true });
  }

  async confirmReset(
    command: ConfirmPasswordResetCommand,
  ): Promise<Optional<{ success: boolean }>> {
    const userOptional = await this.userRepository.findByEmail(command.email);
    if (!userOptional.isPresent()) {
      return Optional.empty();
    }

    const user = userOptional.get();
    if (user['passwordResetCode'] !== command.code) {
      return Optional.empty();
    }

    const hashedPassword = await bcrypt.hash(command.newPassword, 10);
    (user as any).password = hashedPassword;
    (user as any).passwordResetCode = null;

    await this.userRepository.update(user.getCurp(), user);
    return Optional.of({ success: true });
  }

  private generateResetCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
