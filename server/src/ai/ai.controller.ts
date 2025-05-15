// src/ai/ai.controller.ts
import { Controller, Post, Get, Body, Req, Res, UseGuards, Query } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('api/v1/ai')
export class AiController {
    constructor(private aiService: AiService) { }

    @Post('chat')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Process a chat message' })
    @ApiResponse({ status: 200, description: 'Chat message processed successfully' })
    async chat(
        @Req() req: any,
        @Body() body: { message: string; sessionId: string },
        @Res() res: Response,
    ) {
        const userId = req.user.id;
        const { message, sessionId } = body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Use a default session ID if not provided
        const actualSessionId = sessionId || 'default-session';

        // Process the message and return streaming response
        const streamingResponse = await this.aiService.processChatMessage(
            userId,
            actualSessionId,
            message,
        );

        // Return the streaming response
        streamingResponse.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        streamingResponse.body?.pipe(res);
    }

    @Get('recommendations')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get property recommendations based on user preferences' })
    @ApiResponse({ status: 200, description: 'Property recommendations retrieved successfully' })
    async getRecommendations(
        @Req() req: any,
        @Query('count') count: number = 5,
    ) {
        const userId = req.user.id;

        // Get recommendations based on user preferences
        const recommendations = await this.aiService.getPropertyRecommendations(userId, count);

        return recommendations;
    }
}