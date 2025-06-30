import User from '../models/users.model';
import { Optional } from 'typescript-optional';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<Optional<User>>;
  create(user: User): Promise<Optional<User>>;
  update(email: string, user: User): Promise<Optional<User>>;
  delete(email: string): Promise<Optional<User>>;
}
