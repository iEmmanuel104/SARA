// src/ai/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SaraAgent } from './agent/sara-agent';
import { MemoryManager } from './memory/memory-manager';
import { StreamingService } from './streaming/streaming-service';
import { PropertySearchTool } from './tools/property-search.tool';
import { BookingCheckTool } from './tools/booking-check.tool';
import { UserPreferencesTool } from './tools/user-preferences.tool';
import { streamText, type Message, type ToolSet } from 'ai';
import { tool } from 'ai';
import { z } from 'zod';

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private tools: ToolSet;
    private readonly MAX_RETRIES = 3;
    private readonly TIMEOUT_MS = 30000; // 30 seconds

    constructor(
        private readonly saraAgent: SaraAgent,
        private readonly memoryManager: MemoryManager,
        private readonly streamingService: StreamingService,
        private readonly propertySearchTool: PropertySearchTool,
        private readonly bookingCheckTool: BookingCheckTool,
        private readonly userPreferencesTool: UserPreferencesTool,
    ) {
        // Convert tools to Vercel AI SDK format
        this.tools = {
            propertySearch: tool({
                description: 'Search for properties based on criteria',
                parameters: z.object({
                    criteria: z.object({
                        location: z.string().optional(),
                        checkIn: z.string().optional(),
                        checkOut: z.string().optional(),
                        guests: z.number().optional(),
                        priceMin: z.number().optional(),
                        priceMax: z.number().optional(),
                        propertyTypes: z.array(z.string()).optional(),
                        amenities: z.array(z.string()).optional(),
                    }).describe('Search criteria for properties')
                }),
                execute: async ({ criteria }) => {
                    try {
                        return await this.propertySearchTool.call(JSON.stringify(criteria));
                    } catch (error) {
                        this.logger.error(`Property search failed: ${error.message}`);
                        throw new Error('Failed to search properties. Please try again.');
                    }
                }
            }),
            bookingCheck: tool({
                description: 'Check booking availability',
                parameters: z.object({
                    bookingDetails: z.object({
                        propertyId: z.string(),
                        checkIn: z.string(),
                        checkOut: z.string(),
                        guests: z.number(),
                    }).describe('Booking details to check')
                }),
                execute: async ({ bookingDetails }) => {
                    try {
                        return await this.bookingCheckTool.call(JSON.stringify(bookingDetails));
                    } catch (error) {
                        this.logger.error(`Booking check failed: ${error.message}`);
                        throw new Error('Failed to check booking availability. Please try again.');
                    }
                }
            }),
            userPreferences: tool({
                description: 'Get or update user preferences',
                parameters: z.object({
                    action: z.enum(['get', 'update']).describe('Action to perform'),
                    userId: z.string().describe('User ID'),
                    preferences: z.object({
                        language: z.string().optional(),
                        currency: z.string().optional(),
                        notifications: z.boolean().optional(),
                    }).optional().describe('User preferences to update')
                }),
                execute: async ({ action, userId, preferences }) => {
                    try {
                        return await this.userPreferencesTool.call(JSON.stringify({
                            action,
                            userId,
                            preferences
                        }));
                    } catch (error) {
                        this.logger.error(`User preferences operation failed: ${error.message}`);
                        throw new Error('Failed to manage user preferences. Please try again.');
                    }
                }
            })
        };
    }

    async processChatMessage(userId: string, message: string) {
        if (!userId || !message) {
            throw new Error('User ID and message are required');
        }

        try {
            // Get conversation history and user preferences
            const [conversationHistory, userPreferences] = await Promise.all([
                this.memoryManager.getConversationString(userId, 'default'),
                this.memoryManager.getUserPreferences(userId)
            ]);

            // Save user message immediately
            await this.memoryManager.saveMessage(userId, 'default', 'user', message);

            // Create stream using Vercel AI SDK with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.TIMEOUT_MS);
            });

            try {
                const streamResult = await Promise.race([
                    streamText({
                        model: null,
                        messages: [{
                            role: 'user',
                            content: message
                        }],
                        tools: this.tools,
                        system: `You are a helpful AI assistant for a property rental platform. 
                                Use the provided tools to help users find and book properties.
                                Consider user preferences and conversation history when responding.
                                Current conversation history: ${conversationHistory}
                                User preferences: ${JSON.stringify(userPreferences)}`,
                        maxSteps: 10
                    }),
                    timeoutPromise
                ]) as { textStream: AsyncIterable<string> };

                // Process the stream and save the complete response
                let fullResponse = '';
                for await (const chunk of streamResult.textStream) {
                    fullResponse += chunk;
                }

                // Save AI response
                await this.memoryManager.saveMessage(userId, 'default', 'ai', fullResponse);

                return streamResult.textStream;
            } catch (error) {
                if (error.message === 'Request timed out') {
                    this.logger.error('Request timed out');
                    throw new Error('The request took too long to process. Please try again.');
                }
                throw error;
            }
        } catch (error) {
            this.logger.error(`Error processing chat message: ${error.message}`);
            throw new Error('Failed to process message. Please try again.');
        }
    }

    async searchProperties(criteria: any) {
        try {
            return await this.propertySearchTool.call(JSON.stringify(criteria));
        } catch (error) {
            this.logger.error(`Property search failed: ${error.message}`);
            throw new Error('Failed to search properties. Please try again.');
        }
    }

    async checkBookingAvailability(bookingDetails: any) {
        try {
            return await this.bookingCheckTool.call(JSON.stringify(bookingDetails));
        } catch (error) {
            this.logger.error(`Booking check failed: ${error.message}`);
            throw new Error('Failed to check booking availability. Please try again.');
        }
    }

    async getUserPreferences(userId: string) {
        try {
            return await this.userPreferencesTool.call(JSON.stringify({
                action: 'get',
                userId
            }));
        } catch (error) {
            this.logger.error(`Get user preferences failed: ${error.message}`);
            throw new Error('Failed to get user preferences. Please try again.');
        }
    }

    async updateUserPreferences(userId: string, preferences: any) {
        try {
            return await this.userPreferencesTool.call(JSON.stringify({
                action: 'update',
                userId,
                preferences
            }));
        } catch (error) {
            this.logger.error(`Update user preferences failed: ${error.message}`);
            throw new Error('Failed to update user preferences. Please try again.');
        }
    }

    async getPropertyRecommendations(userId: string, searchCriteria?: any) {
        try {
            const criteria = {
                ...searchCriteria,
                userId,
                page: 1,
                pageSize: 5
            };
            return await this.searchProperties(criteria);
        } catch (error) {
            this.logger.error(`Get property recommendations failed: ${error.message}`);
            throw new Error('Failed to get property recommendations. Please try again.');
        }
    }
}