import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainModule } from 'src/domain/domain.module';
import UserRepositoryMongo from '../infrastructure/adapters/respository/users/user.repository.mongo';
import UserSchema from '../infrastructure/adapters/respository/users/schema/user.schema';
import UserFactory from './factory/user.factory';
import { USERS_USECASES } from './usecases/users';

@Module({
  imports: [
    DomainModule,
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  providers: [
    UserFactory,
    ...USERS_USECASES,
    { provide: 'UserRepository', useClass: UserRepositoryMongo },
  ],
  exports: [UserFactory, ...USERS_USECASES],
})
export class ApplicationModule {}
