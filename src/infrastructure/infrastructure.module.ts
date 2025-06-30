import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from '../config/env.enum';
import { ApplicationModule } from '../application/application.module';
import UserSchema from './adapters/respository/users/schema/user.schema';
import UserController from './controllers/user.controller';

@Module({
  imports: [
    ApplicationModule,
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>(Configuration.MONGO_CONNECTION_STRING),
      }),
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UserController],
})
export class InfrastructureModule {}
