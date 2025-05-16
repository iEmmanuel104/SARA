// src/analytics/analytics.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('property/:id')
    @Roles('HOST', 'ADMIN')
    async getPropertyAnalytics(@Param('id') propertyId: string) {
        return this.analyticsService.getPropertyAnalytics(propertyId);
    }

    @Get('user/:id')
    @Roles('USER', 'HOST', 'ADMIN')
    async getUserAnalytics(@Param('id') userId: string) {
        return this.analyticsService.getUserAnalytics(userId);
    }

    @Get('platform')
    @Roles('ADMIN')
    async getPlatformAnalytics() {
        return this.analyticsService.getPlatformAnalytics();
    }
} 