import { Injectable, Inject } from '@nestjs/common';
import User from '../../../domain/models/users.model';
import { UserRepository } from '../../../domain/ports/user.repository';

@Injectable()
export default class GetAllUsersUseCase {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
  ) {}

  public handler(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
