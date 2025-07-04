import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';
import UserCommand from '../../commands/user.command';
import UserFactory from '../../factory/user.factory';

@Injectable()
export default class CreateUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private userFactory: UserFactory,
  ) {}

  public async handler(userCommand: UserCommand): Promise<Optional<User>> {
    const user = await this.userFactory.createUser(userCommand); // <-agrega `await`
    return this.userRepository.create(user);
  }
}
