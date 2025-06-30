import { Injectable, Inject } from '@nestjs/common';
import { Optional } from 'typescript-optional';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';

@Injectable()
export default class GetUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  public handler(email: string): Promise<Optional<User>> {
    return this.userRepository.findByEmail(email);
  }
}
