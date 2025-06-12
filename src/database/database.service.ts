import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('DatabaseService onModuleInit');
    }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
