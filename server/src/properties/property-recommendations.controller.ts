import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PropertyRecommendationsService } from './property-recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Property Recommendations')
@Controller('properties/recommendations')
@UseGuards(JwtAuthGuard)
export class PropertyRecommendationsController {
    constructor(
        private readonly recommendationsService: PropertyRecommendationsService
    ) { }

    @Get('personalized')
    @ApiOperation({ summary: 'Get personalized property recommendations' })
    @ApiResponse({
        status: 200,
        description: 'Returns a list of recommended properties based on user preferences and behavior'
    })
    async getPersonalizedRecommendations(
        @CurrentUser('id') userId: string,
        @Query('limit') limit?: number,
        @Query('useTravelProfile') useTravelProfile?: boolean,
        @Query('useSearchHistory') useSearchHistory?: boolean,
        @Query('useSavedProperties') useSavedProperties?: boolean,
        @Query('useBookingHistory') useBookingHistory?: boolean
    ) {
        return this.recommendationsService.getPersonalizedRecommendations(
            userId,
            limit ? Number(limit) : undefined,
            {
                useTravelProfile: useTravelProfile !== undefined ? useTravelProfile === true : undefined,
                useSearchHistory: useSearchHistory !== undefined ? useSearchHistory === true : undefined,
                useSavedProperties: useSavedProperties !== undefined ? useSavedProperties === true : undefined,
                useBookingHistory: useBookingHistory !== undefined ? useBookingHistory === true : undefined
            }
        );
    }
} 