// src/common/system/system-check.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../../ai/ai.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { LocalizationService } from '../localization/localization.service';
import { SecurityService } from '../security/security.service';

@Injectable()
export class SystemCheckService {
    private readonly logger = new Logger(SystemCheckService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly aiService: AIService,
        private readonly analyticsService: AnalyticsService,
        private readonly localizationService: LocalizationService,
        private readonly securityService: SecurityService,
    ) { }

    async checkSystemHealth() {
        try {
            const results = {
                database: await this.checkDatabase(),
                ai: await this.checkAIService(),
                analytics: await this.checkAnalytics(),
                localization: await this.checkLocalization(),
                security: await this.checkSecurity(),
                config: this.checkConfig(),
            };

            const allHealthy = Object.values(results).every(result => result.healthy);

            return {
                healthy: allHealthy,
                timestamp: new Date(),
                components: results,
            };
        } catch (error) {
            this.logger.error(`System health check failed: ${error.message}`);
            return {
                healthy: false,
                timestamp: new Date(),
                error: error.message,
            };
        }
    }

    private async checkDatabase() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                healthy: true,
                message: 'Database connection is healthy',
            };
        } catch (error) {
            this.logger.error(`Database check failed: ${error.message}`);
            return {
                healthy: false,
                message: `Database check failed: ${error.message}`,
            };
        }
    }

    private async checkAIService() {
        try {
            const testMessage = 'Test message for AI service health check';
            await this.aiService.processChatMessage('system-check', testMessage, { role: 'guest' });
            return {
                healthy: true,
                message: 'AI service is healthy',
            };
        } catch (error) {
            this.logger.error(`AI service check failed: ${error.message}`);
            return {
                healthy: false,
                message: `AI service check failed: ${error.message}`,
            };
        }
    }

    private async checkAnalytics() {
        try {
            await this.analyticsService.getPlatformAnalytics();
            return {
                healthy: true,
                message: 'Analytics service is healthy',
            };
        } catch (error) {
            this.logger.error(`Analytics service check failed: ${error.message}`);
            return {
                healthy: false,
                message: `Analytics service check failed: ${error.message}`,
            };
        }
    }

    private async checkLocalization() {
        try {
            const languages = await this.localizationService.getLanguages();
            return {
                healthy: languages.length > 0,
                message: 'Localization service is healthy',
                supportedLanguages: languages,
            };
        } catch (error) {
            this.logger.error(`Localization service check failed: ${error.message}`);
            return {
                healthy: false,
                message: `Localization service check failed: ${error.message}`,
            };
        }
    }

    private async checkSecurity() {
        try {
            const testToken = await this.securityService.generateSecureToken();
            const isValid = await this.securityService.validateToken(testToken);
            return {
                healthy: !isValid, // Token should not be valid as it's not stored
                message: 'Security service is healthy',
            };
        } catch (error) {
            this.logger.error(`Security service check failed: ${error.message}`);
            return {
                healthy: false,
                message: `Security service check failed: ${error.message}`,
            };
        }
    }

    private checkConfig() {
        try {
            const requiredConfigs = [
                'DATABASE_URL',
                'JWT_SECRET',
                'OPENAI_API_KEY',
                'DEFAULT_LANGUAGE',
            ];

            const missingConfigs = requiredConfigs.filter(
                config => !this.configService.get(config)
            );

            return {
                healthy: missingConfigs.length === 0,
                message: missingConfigs.length === 0
                    ? 'All required configurations are present'
                    : `Missing configurations: ${missingConfigs.join(', ')}`,
            };
        } catch (error) {
            this.logger.error(`Configuration check failed: ${error.message}`);
            return {
                healthy: false,
                message: `Configuration check failed: ${error.message}`,
            };
        }
    }
} 