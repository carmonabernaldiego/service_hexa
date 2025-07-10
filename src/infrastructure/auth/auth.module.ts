import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from '../../config/env.enum';
import { JwtStrategy } from './jwt.strategy';
import { ApplicationModule } from '../../application/application.module';
import { LOGIN_USECASES } from '../../application/usecases/auth';

@Module({
  imports: [
    ApplicationModule,
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
  providers: [JwtStrategy, ...LOGIN_USECASES],
  exports: [JwtModule, ...LOGIN_USECASES],
})
export class AuthModule {}
