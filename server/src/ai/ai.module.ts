// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { SaraAgent } from './agent/sara-agent';
import { MemoryManager } from './memory/memory-manager';
import { StreamingService } from './streaming/streaming-service';
import { PropertySearchTool } from './tools/property-search.tool';
import { BookingCheckTool } from './tools/booking-check.tool';
import { UserPreferencesTool } from './tools/user-preferences.tool';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
    ],
    controllers: [AIController],
    providers: [
        AIService,
        SaraAgent,
        MemoryManager,
        StreamingService,
        PropertySearchTool,
        BookingCheckTool,
        UserPreferencesTool,
    ],
    exports: [AIService],
})
export class AIModule { }