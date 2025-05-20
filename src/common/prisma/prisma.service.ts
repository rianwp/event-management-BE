import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }
  async onModuleInit() {
    await this.$connect();
  }
}
