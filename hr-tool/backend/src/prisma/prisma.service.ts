import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Optional: configure logging, datasources, etc.
      // log: ['query', 'info', 'warn', 'error'], // Example logging configuration
    });
  }

  async onModuleInit() {
    // Prisma Client's $connect method is called automatically when the first query is executed.
    // However, explicitly calling it here can be useful for ensuring the database connection
    // is established when the module initializes, or to catch connection errors early.
    await this.$connect();
    console.log('PrismaService: Database connection established.');
  }

  async onModuleDestroy() {
    // This is important to gracefully close database connections on application shutdown.
    await this.$disconnect();
    console.log('PrismaService: Database connection closed.');
  }

  // Optional: Add a method for clean shutdown, useful for e2e tests or specific scenarios
  // async enableShutdownHooks(app: INestApplication) {
  //   this.$on('beforeExit', async () => {
  //     await app.close();
  //   });
  // }
}
