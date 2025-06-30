import User from '../models/users.model';
import { Optional } from 'typescript-optional';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findByCurp(curp: string): Promise<Optional<User>>;
  create(user: User): Promise<Optional<User>>;
  update(curp: string, user: User): Promise<Optional<User>>;
  delete(curp: string): Promise<Optional<User>>;
}
