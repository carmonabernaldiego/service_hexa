import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from '../config/env.enum';
import { ApplicationModule } from '../application/application.module';
import { UserEntity } from './adapters/respository/users/entity/user.entity';
import UserController from './controllers/user.controller';
import { StorageService } from './providers/storage.service';

@Module({
  imports: [
    ApplicationModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>(Configuration.MYSQL_HOST),
        port: configService.get<number>(Configuration.MYSQL_PORT),
        username: configService.get<string>(Configuration.MYSQL_USERNAME),
        password: configService.get<string>(Configuration.MYSQL_PASSWORD),
        database: configService.get<string>(Configuration.MYSQL_DATABASE),
        entities: [UserEntity],
        synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
        logging: process.env.NODE_ENV === 'development',
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        extra: {
          family: 4,
        },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [StorageService],
  exports: [StorageService],
})
export class InfrastructureModule {}
