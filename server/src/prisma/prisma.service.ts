import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            return;
        }
        // Add models to clean in development
        const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

        return Promise.all(
            models.map((modelKey) => this[modelKey as string].deleteMany()),
        );
    }
} 