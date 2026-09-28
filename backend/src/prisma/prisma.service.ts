import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { db as client } from './db';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly db = client.orm.public;

  async onModuleDestroy() {
    await client.close();
  }
}
