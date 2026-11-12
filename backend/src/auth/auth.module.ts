import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GithubAuthService } from './github-auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [UsersModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, GithubAuthService, JwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
