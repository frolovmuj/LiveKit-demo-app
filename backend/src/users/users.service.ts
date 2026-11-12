import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/users.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.db.User.first({ id });
  }

  async findByEmail(email: string) {
    return this.prisma.db.User.first({ email });
  }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.db.User.create(createUserDto);
  }

  async findByGithubId(githubId: string) {
    return this.prisma.db.User.first({
      github_id: githubId,
    });
  }
}
