import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import User from '../../../../domain/models/users.model';
import { UserEntity } from './entity/user.entity';
import { UserRepository } from '../../../../domain/ports/user.repository';
import DuplicatedUserException from '../../../../domain/exceptions/duplicated-user.exception';
import UserMapper from '../../../mapper/user.mapper';

@Injectable()
export default class UserRepositoryMySQL implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { active: true },
      order: { createAt: 'DESC' },
    });
    return UserMapper.toDomains(users);
  }

  public async findByCurp(curp: string): Promise<Optional<User>> {
    const user = await this.userRepository.findOne({
      where: { curp, active: true },
    });
    return UserMapper.toDomain(user);
  }

  public async create(user: User): Promise<Optional<User>> {
    try {
      // Verificar si ya existe un usuario con el mismo CURP
      const existingByCurp = await this.userRepository.findOne({
        where: { curp: user.getCurp() },
      });

      if (existingByCurp) {
        throw new DuplicatedUserException('Ya existe un usuario con este CURP');
      }

      // Verificar si ya existe un usuario con el mismo email
      const existingByEmail = await this.userRepository.findOne({
        where: { email: user.getEmail() },
      });

      if (existingByEmail) {
        throw new DuplicatedUserException(
          'Ya existe un usuario con este email',
        );
      }

      const userEntity = this.userRepository.create({
        nombre: user['nombre'],
        apellidoPaterno: user['apellidoPaterno'],
        apellidoMaterno: user['apellidoMaterno'],
        curp: user.getCurp(),
        imagen: user['imagen'],
        email: user.getEmail(),
        password: user['password'],
        twoFactorAuthSecret: user['twoFactorAuthSecret'],
        isTwoFactorEnable: user['isTwoFactorEnable'],
        role: user['role'],
        active: user['active'],
        passwordResetCode: user['passwordResetCode'],
        createAt: user['createAt'],
      });

      const savedUser = await this.userRepository.save(userEntity);
      return UserMapper.toDomain(savedUser);
    } catch (error) {
      if (error instanceof DuplicatedUserException) {
        throw error;
      }

      // Manejar errores de duplicados de MySQL
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('curp')) {
          throw new DuplicatedUserException(
            'Ya existe un usuario con este CURP',
          );
        } else if (error.message.includes('email')) {
          throw new DuplicatedUserException(
            'Ya existe un usuario con este email',
          );
        }
      }

      throw error;
    }
  }

  public async update(curp: string, user: User): Promise<Optional<User>> {
    const existingUser = await this.userRepository.findOne({
      where: { curp, active: true },
    });

    if (!existingUser) {
      return Optional.empty<User>();
    }

    // Actualizar solo los campos que han cambiado
    const updateData = {
      nombre: user['nombre'],
      apellidoPaterno: user['apellidoPaterno'],
      apellidoMaterno: user['apellidoMaterno'],
      imagen: user['imagen'],
      email: user.getEmail(),
      password: user['password'],
      twoFactorAuthSecret: user['twoFactorAuthSecret'],
      isTwoFactorEnable: user['isTwoFactorEnable'],
      role: user['role'],
      active: user['active'],
      passwordResetCode: user['passwordResetCode'],
    };

    await this.userRepository.update({ curp }, updateData);

    const updatedUser = await this.userRepository.findOne({
      where: { curp },
    });

    return UserMapper.toDomain(updatedUser);
  }

  public async delete(curp: string): Promise<Optional<User>> {
    const user = await this.userRepository.findOne({
      where: { curp, active: true },
    });

    if (!user) {
      return Optional.empty<User>();
    }

    // Soft delete - solo cambiar active a false
    await this.userRepository.update({ curp }, { active: false });

    const deletedUser = await this.userRepository.findOne({
      where: { curp },
    });

    return UserMapper.toDomain(deletedUser);
  }
}
