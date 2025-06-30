import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import User from '../../../../domain/models/users.model';
import { UserEntity } from './entity/user.entity';
import { Optional } from 'typescript-optional';
import UserMapper from '../../../mapper/user.mapper';
import { UserRepository } from '../../../../domain/ports/user.repository';

@Injectable()
export default class UserRepositoryMongo implements UserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserEntity>,
  ) {}

  public async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return UserMapper.toDomains(users);
  }

  public async findByEmail(email: string): Promise<Optional<User>> {
    const user = await this.userModel.findOne({ email }).exec();
    return UserMapper.toDomain(user);
  }

  public async create(user: User): Promise<Optional<User>> {
    const created = new this.userModel(user);
    const result = await created.save();
    return UserMapper.toDomain(result);
  }

  public async update(email: string, user: User): Promise<Optional<User>> {
    const updated = await this.userModel
      .findOneAndUpdate({ email }, user, { new: true })
      .exec();
    return UserMapper.toDomain(updated);
  }

  public async delete(email: string): Promise<Optional<User>> {
    const deleted = await this.userModel.findOneAndDelete({ email }).exec();
    return UserMapper.toDomain(deleted);
  }
}
