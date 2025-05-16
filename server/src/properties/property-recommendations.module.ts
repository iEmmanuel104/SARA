import { Module } from '@nestjs/common';
import { PropertyRecommendationsService } from './property-recommendations.service';
import { PropertyRecommendationsController } from './property-recommendations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserPreferencesModule } from '../users/user-preferences.module';

@Module({
    imports: [PrismaModule, UserPreferencesModule],
    controllers: [PropertyRecommendationsController],
    providers: [PropertyRecommendationsService],
    exports: [PropertyRecommendationsService]
})
export class PropertyRecommendationsModule { } 