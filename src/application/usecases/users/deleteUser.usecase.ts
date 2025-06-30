import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';

@Injectable()
export default class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  public handler(curp: string): Promise<Optional<User>> {
    return this.userRepository.delete(curp);
  }
}
