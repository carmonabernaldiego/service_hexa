import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import User from '../../../../domain/models/users.model';
import { UserEntity } from './entity/user.entity';
import { Optional } from 'typescript-optional';
import UserMapper from '../../../mapper/user.mapper';
import { UserRepository } from '../../../../domain/ports/user.repository';
import DuplicatedUserException from 'src/domain/exceptions/duplicated-user.exception';
import { MongoServerError } from 'mongodb';

@Injectable()
export default class UserRepositoryMongo implements UserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserEntity>,
  ) {}

  public async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return UserMapper.toDomains(users);
  }

  public async findByCurp(curp: string): Promise<Optional<User>> {
    const user = await this.userModel.findOne({ curp }).exec();
    return UserMapper.toDomain(user);
  }

  public async create(user: User): Promise<Optional<User>> {
    try {
      const created = new this.userModel(user);
      const result = await created.save();
      return UserMapper.toDomain(result);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        if (error.message.includes('curp')) {
          throw new DuplicatedUserException(
            'Ya existe un usuario con este CURP',
          );
        } else if (error.message.includes('email')) {
          throw new DuplicatedUserException(
            'Ya existe un usuario con este email',
          );
        } else {
          throw new DuplicatedUserException('Duplicado en otro campo único');
        }
      }
      throw error;
    }
  }

  public async update(curp: string, user: User): Promise<Optional<User>> {
    const updated = await this.userModel
      .findOneAndUpdate({ curp }, user, { new: true })
      .exec();
    return UserMapper.toDomain(updated);
  }

  public async delete(curp: string): Promise<Optional<User>> {
    const deleted = await this.userModel
      .findOneAndUpdate(
        { curp, active: true },
        { active: false },
        { new: true },
      )
      .exec();
    return UserMapper.toDomain(deleted);
  }
}
