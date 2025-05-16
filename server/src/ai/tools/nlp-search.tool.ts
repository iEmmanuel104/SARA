// src/ai/tools/nlp-search.tool.ts
import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { PrismaService } from '../../prisma/prisma.service';
import { MemoryManager } from '../memory/memory-manager';

@Injectable()
export class NLPSearchTool extends Tool {
    name = 'nlp-search';
    description = `
    Process natural language search queries and convert them to structured search criteria.
    Input should be a JSON object with:
    {
      "query": string, // Natural language search query
      "userId": string, // User ID for context
      "sessionId": string // Session ID for conversation context
    }
  `;

    constructor(
        private prisma: PrismaService,
        private memoryManager: MemoryManager
    ) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            const { query, userId, sessionId } = JSON.parse(input);

            // Get user context
            const [userPreferences, conversationHistory, savedProperties] = await Promise.all([
                this.memoryManager.getUserPreferences(userId),
                this.memoryManager.getConversationString(userId, sessionId),
                this.getUserSavedProperties(userId)
            ]);

            // Extract entities and intent from the query
            const extractedInfo = await this.extractSearchCriteria(query, {
                userPreferences,
                conversationHistory,
                savedProperties
            });

            // Convert to structured search criteria
            const searchCriteria = this.convertToSearchCriteria(extractedInfo);

            return JSON.stringify({
                status: 'success',
                searchCriteria,
                extractedInfo
            });
        } catch (error) {
            console.error('Error in NLP search tool:', error);
            return JSON.stringify({
                status: 'error',
                message: error.message || 'Failed to process search query'
            });
        }
    }

    private async getUserSavedProperties(userId: string) {
        return this.prisma.savedProperty.findMany({
            where: { userId },
            include: {
                property: {
                    include: {
                        amenities: {
                            include: {
                                amenity: true
                            }
                        }
                    }
                }
            }
        });
    }

    private async extractSearchCriteria(query: string, context: any) {
        // This is where you would integrate with an NLP service
        // For now, we'll use a simple rule-based approach
        const criteria: any = {};

        // Extract dates
        const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/g;
        const dates = [...query.matchAll(datePattern)];
        if (dates.length >= 2) {
            criteria.checkIn = new Date(dates[0][0]).toISOString().split('T')[0];
            criteria.checkOut = new Date(dates[1][0]).toISOString().split('T')[0];
        }

        // Extract guest count
        const guestPattern = /(\d+)\s*(?:guests?|people|persons?)/i;
        const guestMatch = query.match(guestPattern);
        if (guestMatch) {
            criteria.guests = parseInt(guestMatch[1]);
        }

        // Extract price range
        const pricePattern = /(\$?\d+)(?:\s*-\s*\$?(\d+))?\s*(?:per\s*(?:night|day))?/i;
        const priceMatch = query.match(pricePattern);
        if (priceMatch) {
            criteria.priceMin = parseInt(priceMatch[1].replace('$', ''));
            if (priceMatch[2]) {
                criteria.priceMax = parseInt(priceMatch[2].replace('$', ''));
            }
        }

        // Extract location
        const locationPattern = /(?:in|at|near)\s+([^,.]+)/i;
        const locationMatch = query.match(locationPattern);
        if (locationMatch) {
            criteria.location = locationMatch[1].trim();
        }

        // Extract property type
        const propertyTypes = ['apartment', 'house', 'villa', 'condo', 'studio'];
        const typeMatch = propertyTypes.find(type =>
            query.toLowerCase().includes(type)
        );
        if (typeMatch) {
            criteria.propertyTypes = [typeMatch];
        }

        // Extract amenities
        const amenities = ['wifi', 'pool', 'parking', 'gym', 'kitchen'];
        criteria.amenities = amenities.filter(amenity =>
            query.toLowerCase().includes(amenity)
        );

        // Consider user preferences and history
        if (context.userPreferences) {
            const prefs = JSON.parse(context.userPreferences);
            if (prefs.preferredPropertyTypes && !criteria.propertyTypes) {
                criteria.propertyTypes = prefs.preferredPropertyTypes;
            }
            if (prefs.preferredLocations && !criteria.location) {
                criteria.location = prefs.preferredLocations[0];
            }
        }

        return criteria;
    }

    private convertToSearchCriteria(extractedInfo: any) {
        return {
            ...extractedInfo,
            page: 1,
            pageSize: 10
        };
    }
} 