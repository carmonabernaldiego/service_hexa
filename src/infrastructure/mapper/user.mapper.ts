import { Optional } from 'typescript-optional';
import User from '../../domain/models/users.model';
import { UserEntity } from '../adapters/respository/users/entity/user.entity';

export default class UserMapper {
  public static toDomain(entity: UserEntity | null): Optional<User> {
    if (!entity) {
      return Optional.empty<User>();
    }
    const user = new User(
      entity.id,
      entity.nombre,
      entity.apellidoPaterno,
      entity.apellidoMaterno,
      entity.curp,
      entity.imagen,
      entity.email,
      entity.password,
      entity.twoFactorAuthSecret,
      entity.isTwoFactorEnable,
      entity.role,
      entity.active,
      entity.passwordResetCode,
    );
    user.setCreateAt(entity.createAt);
    return Optional.of(user);
  }

  public static toDomains(entities: UserEntity[]): User[] {
    return entities.map((e) => this.toDomain(e).get());
  }
}
