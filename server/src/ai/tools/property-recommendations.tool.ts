// src/ai/tools/property-recommendations.tool.ts
import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { PrismaService } from '../../prisma/prisma.service';
import { MemoryManager } from '../memory/memory-manager';
import { Action } from '@coinbase/agentkit';

@Injectable()
export class PropertyRecommendationsTool extends Tool implements Action {
    name = 'property-recommendations';
    description = `
    Get personalized property recommendations based on user preferences, history, and behavior.
    Input should be a JSON object with:
    {
      "userId": string, // User ID
      "limit": number, // Number of recommendations (optional, default: 5)
      "context": { // Additional context for recommendations
        "searchCriteria": object, // Current search criteria (optional)
        "sessionId": string // Current session ID (optional)
      }
    }
  `;

    constructor(
        private prisma: PrismaService,
        private memoryManager: MemoryManager
    ) {
        super();
    }

    async execute(input: string): Promise<string> {
        return this._call(input);
    }

    protected async _call(input: string): Promise<string> {
        try {
            const { userId, limit = 5, context = {} } = JSON.parse(input);

            // Get user data
            const [
                userPreferences,
                savedProperties,
                recentBookings,
                searchHistory
            ] = await Promise.all([
                this.memoryManager.getUserPreferences(userId),
                this.getUserSavedProperties(userId),
                this.getUserRecentBookings(userId),
                this.getUserSearchHistory(userId)
            ]);

            // Generate recommendations
            const recommendations = await this.generateRecommendations({
                userId,
                userPreferences,
                savedProperties,
                recentBookings,
                searchHistory,
                context,
                limit
            });

            return JSON.stringify({
                status: 'success',
                recommendations
            });
        } catch (error) {
            console.error('Error in property recommendations tool:', error);
            return JSON.stringify({
                status: 'error',
                message: error.message || 'Failed to generate recommendations'
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

    private async getUserRecentBookings(userId: string) {
        return this.prisma.booking.findMany({
            where: {
                guestId: userId,
                status: 'completed'
            },
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
            },
            orderBy: {
                checkInDate: 'desc'
            },
            take: 5
        });
    }

    private async getUserSearchHistory(userId: string) {
        return this.prisma.searchLog.findMany({
            where: { userId },
            orderBy: {
                searchTimestamp: 'desc'
            },
            take: 10
        });
    }

    private async generateRecommendations(params: any) {
        const {
            userId,
            userPreferences,
            savedProperties,
            recentBookings,
            searchHistory,
            context,
            limit
        } = params;

        // Build recommendation criteria based on user data
        const criteria = this.buildRecommendationCriteria({
            userPreferences,
            savedProperties,
            recentBookings,
            searchHistory,
            context
        });

        // Get properties matching the criteria
        const properties = await this.prisma.property.findMany({
            where: {
                ...criteria,
                status: 'active',
                deletedAt: null,
                NOT: {
                    id: {
                        in: savedProperties.map(sp => sp.propertyId)
                    }
                }
            },
            include: {
                address: true,
                host: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                        hostProfile: true
                    }
                },
                images: {
                    take: 1,
                    orderBy: {
                        isCoverImage: 'desc'
                    }
                },
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            },
            take: limit,
            orderBy: {
                averageRating: 'desc'
            }
        });

        // Format recommendations
        return properties.map(property => ({
            id: property.id,
            name: property.propertyName,
            description: property.summary,
            type: property.propertyType,
            location: property.address[0] ?
                `${property.address[0].city}, ${property.address[0].country}` :
                'Location not specified',
            price: {
                base: property.basePrice,
                currency: property.currency,
                cleaning: property.cleaningFee
            },
            capacity: {
                guests: property.capacityGuests,
                bedrooms: property.capacityBedrooms,
                beds: property.capacityBeds,
                bathrooms: property.capacityBathrooms
            },
            amenities: property.amenities.map(a => a.amenity.name),
            rating: property.averageRating,
            reviewCount: property.totalReviews,
            image: property.images[0]?.imageUrl || null,
            host: {
                id: property.host.id,
                name: `${property.host.firstName} ${property.host.lastName}`,
                isSuperhost: property.host.hostProfile?.isSuperhost || false,
                profilePicture: property.host.profilePictureUrl
            },
            matchScore: this.calculateMatchScore(property, {
                userPreferences,
                savedProperties,
                recentBookings
            })
        }));
    }

    private buildRecommendationCriteria(params: any) {
        const {
            userPreferences,
            savedProperties,
            recentBookings,
            searchHistory,
            context
        } = params;

        const criteria: any = {};

        // Add preferences from user preferences
        if (userPreferences) {
            const prefs = JSON.parse(userPreferences);
            if (prefs.preferredPropertyTypes) {
                criteria.propertyType = {
                    in: prefs.preferredPropertyTypes
                };
            }
            if (prefs.preferredLocations) {
                criteria.address = {
                    some: {
                        city: {
                            in: prefs.preferredLocations
                        }
                    }
                };
            }
        }

        // Add criteria from recent bookings
        if (recentBookings.length > 0) {
            const recentPropertyTypes = [...new Set(
                recentBookings.map(booking => booking.property.propertyType)
            )];
            if (recentPropertyTypes.length > 0) {
                criteria.propertyType = {
                    in: recentPropertyTypes
                };
            }
        }

        // Add criteria from search history
        if (searchHistory.length > 0) {
            const recentSearches = searchHistory.map(search => search.searchParams);
            // Combine search criteria from recent searches
            // This is a simplified approach - you might want to use more sophisticated
            // methods to combine search criteria
        }

        // Add context-specific criteria
        if (context.searchCriteria) {
            Object.assign(criteria, context.searchCriteria);
        }

        return criteria;
    }

    private calculateMatchScore(property: any, context: any) {
        let score = 0;
        const { userPreferences, savedProperties, recentBookings } = context;

        // Base score from rating
        score += (property.averageRating || 0) * 20;

        // Match with user preferences
        if (userPreferences) {
            const prefs = JSON.parse(userPreferences);
            if (prefs.preferredPropertyTypes?.includes(property.propertyType)) {
                score += 20;
            }
            if (prefs.preferredLocations?.includes(property.address[0]?.city)) {
                score += 20;
            }
        }

        // Match with saved properties
        const savedPropertyTypes = savedProperties.map(sp => sp.property.propertyType);
        if (savedPropertyTypes.includes(property.propertyType)) {
            score += 15;
        }

        // Match with recent bookings
        const recentPropertyTypes = recentBookings.map(booking => booking.property.propertyType);
        if (recentPropertyTypes.includes(property.propertyType)) {
            score += 15;
        }

        // Normalize score to 0-100
        return Math.min(100, score);
    }
} 