import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';
import UserCommand from '../../commands/user.command';
import UserFactory from '../../factory/user.factory';

@Injectable()
export default class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private userFactory: UserFactory,
  ) {}

  public handler(
    curp: string,
    userCommand: UserCommand,
  ): Promise<Optional<User>> {
    const user = this.userFactory.createUser(userCommand);
    return this.userRepository.update(curp, user);
  }
}
