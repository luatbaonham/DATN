import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '@modules/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
// import { TokenCleanupService } from './jobs/token-cleanup.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    ConfigModule,
  ],
  providers: [AuthService], //dùng sau: TokenCleanupService
  controllers: [AuthController],
})
export class AuthModule {}
