import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from '../../config/env.enum';
import { JwtStrategy } from './jwt.strategy';
import { ApplicationModule } from '../../application/application.module';
import AuthController from '../controllers/auth.controller';
import { AUTH_USECASES } from '../../application/usecases/auth';
import { StorageService } from '../providers/storage.service';
import { RabbitMQModule } from '../providers/rabbitmq.module';

@Module({
  imports: [
    ApplicationModule,
    RabbitMQModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(Configuration.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(Configuration.JWT_EXPIRES_IN),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, StorageService, ...AUTH_USECASES],
  exports: [JwtModule, ...AUTH_USECASES],
})
export class AuthModule {}
