// src/ai/ai.controller.ts
import { Controller, Post, Get, Body, Req, Res, UseGuards, Query, Param } from '@nestjs/common';
import { Response } from 'express';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @Post('chat')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Process a chat message' })
    @ApiResponse({ status: 200, description: 'Chat message processed successfully' })
    async processChatMessage(
        @Req() req: any,
        @Body() body: { userId: string; message: string },
        @Res() res: Response,
    ) {
        const userId = req.user.id;
        const { message } = body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Set headers for streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Process the message and return streaming response
        const stream = await this.aiService.processChatMessage(userId, message);

        // Pipe the stream to the response
        for await (const chunk of stream) {
            res.write(`data: ${chunk}\n\n`);
        }

        res.end();
    }

    @Get('recommendations/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get property recommendations based on user preferences' })
    @ApiResponse({ status: 200, description: 'Property recommendations retrieved successfully' })
    async getRecommendations(
        @Param('userId') userId: string,
        @Body() searchCriteria?: any
    ) {
        return this.aiService.getPropertyRecommendations(userId, searchCriteria);
    }
}