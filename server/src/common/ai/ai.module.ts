import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AIAgent } from './ai-agent';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: AIAgent,
            useFactory: (configService: ConfigService) => {
                return new AIAgent({
                    apiKey: configService.get<string>('AI_AGENT_API_KEY'),
                    model: configService.get<string>('AI_AGENT_MODEL'),
                    baseUrl: configService.get<string>('AI_AGENT_BASE_URL')
                });
            },
            inject: [ConfigService]
        }
    ],
    exports: [AIAgent]
})
export class AIModule { } 