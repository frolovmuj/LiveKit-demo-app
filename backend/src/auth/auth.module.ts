import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GithubAuthService } from './github-auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GithubAuthService, JwtStrategy],
})
export class AuthModule {}
