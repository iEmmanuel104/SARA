// src/common/system/system-check.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AIModule } from '../../ai/ai.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { LocalizationModule } from '../localization/localization.module';
import { SecurityModule } from '../security/security.module';
import { SystemCheckService } from './system-check.service';
import { SystemCheckController } from './system-check.controller';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        AIModule,
        AnalyticsModule,
        LocalizationModule,
        SecurityModule,
    ],
    controllers: [SystemCheckController],
    providers: [SystemCheckService],
    exports: [SystemCheckService],
})
export class SystemCheckModule { } 