import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/auth/user/entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

const configService = new ConfigService();
@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([UserModel]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      }),
    }),
    PassportModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
