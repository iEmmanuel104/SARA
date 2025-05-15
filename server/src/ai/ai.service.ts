// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { SaraAgent } from './agent/sara-agent';
import { PropertySearchTool } from './tools/property-search.tool';
import { BookingCheckTool } from './tools/booking-check.tool';
import { UserPreferencesTool } from './tools/user-preferences.tool';
import { MemoryManager } from './memory/memory-manager';
import { StreamingService } from './streaming/streaming-service';
import { AgentExecutor } from '@coinbase/agentkit';
import { StreamingTextResponse } from 'ai';

@Injectable()
export class AiService {
    constructor(
        private saraAgent: SaraAgent,
        private propertySearchTool: PropertySearchTool,
        private bookingCheckTool: BookingCheckTool,
        private userPreferencesTool: UserPreferencesTool,
        private memoryManager: MemoryManager,
        private streamingService: StreamingService,
    ) { }

    /**
     * Process a chat message and return a streaming response
     */
    async processChatMessage(userId: string, sessionId: string, message: string) {
        // Create tools for the agent
        const tools = [
            this.propertySearchTool,
            this.bookingCheckTool,
            this.userPreferencesTool,
        ];

        // Create agent executor
        const executor = await this.saraAgent.createAgentExecutor(tools);

        // Get conversation history and user preferences
        const chatHistory = await this.memoryManager.getConversationString(userId, sessionId);
        const userPreferences = await this.memoryManager.getUserPreferences(userId);

        // Create streaming handler
        const { stream, handlers } = this.streamingService.createStream();

        // Save the user message right away
        await this.memoryManager.saveMessage(userId, sessionId, 'user', message);

        // Process the message in the background (don't await)
        this.saraAgent.processMessage(
            userId,
            sessionId,
            message,
            executor,
            chatHistory,
            userPreferences,
            handlers,
        ).then(async (result) => {
            // After processing is complete, save AI message to database if not already saved
            // This is a safety measure in case the streaming doesn't capture everything
            if (result?.output) {
                await this.memoryManager.saveMessage(userId, sessionId, 'ai', result.output);
            }
        }).catch(error => {
            console.error('Error processing message:', error);
        });

        // Return streaming response
        return new StreamingTextResponse(stream);
    }

    /**
     * Get personalized property recommendations based on user preferences
     */
    async getPropertyRecommendations(userId: string, count: number = 5) {
        try {
            // This is a simplified implementation
            // In a real application, this would use more sophisticated recommendation algorithms

            // Get user preferences
            const userPreferencesStr = await this.memoryManager.getUserPreferences(userId);

            // Convert to an object format for easier parsing
            const lines = userPreferencesStr.split('\n');
            const preferencesMap: Record<string, any> = {};

            for (const line of lines) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();

                    // Try to parse JSON if possible
                    try {
                        const jsonStart = value.indexOf('{');
                        const jsonEnd = value.lastIndexOf('}');
                        if (jsonStart >= 0 && jsonEnd > jsonStart) {
                            const jsonStr = value.substring(jsonStart, jsonEnd + 1);
                            value = JSON.parse(jsonStr);
                        }
                    } catch (e) {
                        // If parsing fails, keep the string value
                    }

                    preferencesMap[key] = value;
                }
            }

            // Prepare search criteria based on preferences
            const searchCriteria: any = {};

            // Add location if available
            if (preferencesMap.favoriteLocations && Array.isArray(preferencesMap.favoriteLocations)) {
                searchCriteria.location = preferencesMap.favoriteLocations[0]; // Use first favorite location
            }

            // Add property types if available
            if (preferencesMap.preferredPropertyTypes && Array.isArray(preferencesMap.preferredPropertyTypes)) {
                searchCriteria.propertyTypes = preferencesMap.preferredPropertyTypes;
            }

            // Add budget range if available
            if (preferencesMap.budgetRange) {
                searchCriteria.priceMin = preferencesMap.budgetRange.min;
                searchCriteria.priceMax = preferencesMap.budgetRange.max;
            }

            // Add amenities if available
            if (preferencesMap.preferredAmenities && Array.isArray(preferencesMap.preferredAmenities)) {
                searchCriteria.amenities = preferencesMap.preferredAmenities;
            }

            // If we don't have enough criteria, get featured properties instead
            if (Object.keys(searchCriteria).length < 2) {
                return this.getFeaturedProperties(count);
            }

            // Use the property search tool to get recommendations
            searchCriteria.page = 1;
            searchCriteria.pageSize = count;

            const searchResult = await this.propertySearchTool._call(JSON.stringify(searchCriteria));
            const parsedResult = JSON.parse(searchResult);

            return {
                recommendations: parsedResult.properties || [],
                criteria: searchCriteria,
            };
        } catch (error) {
            console.error('Error getting property recommendations:', error);
            // Fall back to featured properties
            return this.getFeaturedProperties(count);
        }
    }

    /**
     * Get featured properties (used as fallback)
     */
    private async getFeaturedProperties(count: number = 5) {
        try {
            const searchCriteria = {
                page: 1,
                pageSize: count,
            };

            const searchResult = await this.propertySearchTool._call(JSON.stringify(searchCriteria));
            const parsedResult = JSON.parse(searchResult);

            return {
                recommendations: parsedResult.properties || [],
                criteria: { featured: true },
            };
        } catch (error) {
            console.error('Error getting featured properties:', error);
            return {
                recommendations: [],
                criteria: { featured: true },
                error: 'Unable to retrieve properties',
            };
        }
    }
}