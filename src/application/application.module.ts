// src/application/application.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainModule } from '../domain/domain.module';
import { UserEntity } from '../infrastructure/adapters/respository/users/entity/user.entity';
import UserRepositoryMySQL from '../infrastructure/adapters/respository/users/user.repository.mysql';
import UserFactory from './factory/user.factory';
import { USERS_USECASES } from './usecases/users';
import { RabbitMQModule } from '../infrastructure/providers/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule,
    DomainModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    UserFactory,
    ...USERS_USECASES,
    { provide: 'UserRepository', useClass: UserRepositoryMySQL },
  ],
  exports: [UserFactory, ...USERS_USECASES, RabbitMQModule],
})
export class ApplicationModule {}
