import { Injectable } from '@nestjs/common';

import { RegisterDto } from '../auth/dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.db.User.first({ id });
  }

  async findByEmail(email: string) {
    return this.prisma.db.User.first({ email });
  }

  async create(createUserDto: RegisterDto) {
    return this.prisma.db.User.create(createUserDto);
  }
}
