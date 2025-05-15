// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SaraAgent } from './agent/sara-agent';
import { PropertySearchTool } from './tools/property-search.tool';
import { BookingCheckTool } from './tools/booking-check.tool';
import { UserPreferencesTool } from './tools/user-preferences.tool';
import { MemoryManager } from './memory/memory-manager';
import { StreamingService } from './streaming/streaming-service';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
    ],
    controllers: [AiController],
    providers: [
        AiService,
        SaraAgent,
        MemoryManager,
        StreamingService,
        PropertySearchTool,
        BookingCheckTool,
        UserPreferencesTool,
    ],
    exports: [AiService],
})
export class AiModule { }