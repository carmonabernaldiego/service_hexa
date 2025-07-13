import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainModule } from '../domain/domain.module';
import { UserEntity } from '../infrastructure/adapters/respository/users/entity/user.entity';
import UserRepositoryMySQL from '../infrastructure/adapters/respository/users/user.repository.mysql';
import UserFactory from './factory/user.factory';
import { USERS_USECASES } from './usecases/users';
import { RabbitMQModule } from '../infrastructure/providers/rabbitmq.module';
import { TwoFactorAuthService } from '../infrastructure/providers/two-factor-auth.service';
import { PasswordResetUseCase } from './usecases/auth/password-reset.usecase';

@Module({
  imports: [
    RabbitMQModule,
    DomainModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    PasswordResetUseCase,
    UserFactory,
    ...USERS_USECASES,
    { provide: 'UserRepository', useClass: UserRepositoryMySQL },
    {
      provide: 'TwoFactorAuthProvider',
      useClass: TwoFactorAuthService,
    },
  ],
  exports: [
    PasswordResetUseCase,
    UserFactory,
    ...USERS_USECASES,
    'UserRepository',
    'TwoFactorAuthProvider',
  ],
})
export class ApplicationModule {}
