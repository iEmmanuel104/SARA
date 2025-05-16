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
import { NLPSearchTool } from './tools/nlp-search.tool';
import { PropertyRecommendationsTool } from './tools/property-recommendations.tool';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        CloudinaryModule,
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
        NLPSearchTool,
        PropertyRecommendationsTool,
    ],
    exports: [
        AIService,
        SaraAgent,
        PropertySearchTool,
        BookingCheckTool,
        UserPreferencesTool,
        NLPSearchTool,
        PropertyRecommendationsTool,
    ],
})
export class AIModule { }