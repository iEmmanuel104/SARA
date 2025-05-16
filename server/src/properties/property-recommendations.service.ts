import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPreferencesService } from '../users/user-preferences.service';

@Injectable()
export class PropertyRecommendationsService {
    private readonly logger = new Logger(PropertyRecommendationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly userPreferencesService: UserPreferencesService
    ) { }

    async getPersonalizedRecommendations(
        userId: string,
        limit: number = 10,
        options: {
            useTravelProfile?: boolean;
            useSearchHistory?: boolean;
            useSavedProperties?: boolean;
            useBookingHistory?: boolean;
        } = {}
    ) {
        const {
            useTravelProfile = true,
            useSearchHistory = true,
            useSavedProperties = true,
            useBookingHistory = true
        } = options;

        // Get user preferences and data
        const [
            preferences,
            travelProfile,
            searchHistory,
            savedProperties,
            bookingHistory
        ] = await Promise.all([
            this.userPreferencesService.getUserPreferences(userId),
            useTravelProfile ? this.userPreferencesService.getDefaultTravelProfile(userId) : null,
            useSearchHistory ? this.getRecentSearchHistory(userId) : [],
            useSavedProperties ? this.getSavedProperties(userId) : [],
            useBookingHistory ? this.getRecentBookings(userId) : []
        ]);

        // Build recommendation criteria
        const criteria = this.buildRecommendationCriteria({
            preferences,
            travelProfile,
            searchHistory,
            savedProperties,
            bookingHistory
        });

        // Get recommended properties
        const properties = await this.prisma.property.findMany({
            where: {
                status: 'active',
                ...criteria
            },
            include: {
                host: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        hostProfile: true
                    }
                },
                amenities: {
                    include: {
                        amenity: true
                    }
                },
                images: true,
                address: true
            },
            take: limit
        });

        // Calculate match scores
        const scoredProperties = await Promise.all(
            properties.map(async property => ({
                ...property,
                matchScore: await this.calculateMatchScore(property, {
                    preferences,
                    travelProfile,
                    searchHistory,
                    savedProperties,
                    bookingHistory
                })
            }))
        );

        // Sort by match score
        return scoredProperties.sort((a, b) => b.matchScore - a.matchScore);
    }

    private async getRecentSearchHistory(userId: string) {
        return this.prisma.searchLog.findMany({
            where: { userId },
            orderBy: { searchTimestamp: 'desc' },
            take: 10
        });
    }

    private async getSavedProperties(userId: string) {
        return this.prisma.savedProperty.findMany({
            where: { userId },
            include: {
                property: true
            }
        });
    }

    private async getRecentBookings(userId: string) {
        return this.prisma.booking.findMany({
            where: {
                guestId: userId,
                status: 'completed'
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
    }

    private buildRecommendationCriteria(data: any) {
        const criteria: any = {};

        // Add criteria based on travel profile
        if (data.travelProfile) {
            if (data.travelProfile.preferredPropertyTypes?.length) {
                criteria.propertyType = {
                    in: data.travelProfile.preferredPropertyTypes
                };
            }

            if (data.travelProfile.budgetRangeMin || data.travelProfile.budgetRangeMax) {
                criteria.basePrice = {
                    ...(data.travelProfile.budgetRangeMin && {
                        gte: data.travelProfile.budgetRangeMin
                    }),
                    ...(data.travelProfile.budgetRangeMax && {
                        lte: data.travelProfile.budgetRangeMax
                    })
                };
            }

            if (data.travelProfile.mustHaveAmenities?.length) {
                criteria.amenities = {
                    some: {
                        amenityId: {
                            in: data.travelProfile.mustHaveAmenities
                        }
                    }
                };
            }
        }

        // Add criteria based on search history
        if (data.searchHistory?.length) {
            const commonLocations = this.extractCommonLocations(data.searchHistory);
            if (commonLocations.length) {
                criteria.address = {
                    city: {
                        in: commonLocations
                    }
                };
            }
        }

        // Add criteria based on saved properties
        if (data.savedProperties?.length) {
            const savedPropertyTypes = data.savedProperties.map(
                (sp: any) => sp.property.propertyType
            );
            if (savedPropertyTypes.length) {
                criteria.propertyType = {
                    in: savedPropertyTypes
                };
            }
        }

        // Add criteria based on booking history
        if (data.bookingHistory?.length) {
            const bookedPropertyTypes = data.bookingHistory.map(
                (booking: any) => booking.property.propertyType
            );
            if (bookedPropertyTypes.length) {
                criteria.propertyType = {
                    in: bookedPropertyTypes
                };
            }
        }

        return criteria;
    }

    private async calculateMatchScore(property: any, context: any) {
        let score = 0;
        const weights = {
            travelProfile: 0.4,
            preferences: 0.3,
            searchHistory: 0.2,
            savedProperties: 0.1
        };

        // Score based on travel profile
        if (context.travelProfile) {
            const travelProfileScore = this.calculateTravelProfileScore(
                property,
                context.travelProfile
            );
            score += travelProfileScore * weights.travelProfile;
        }

        // Score based on preferences
        if (context.preferences?.length) {
            const preferencesScore = this.calculatePreferencesScore(
                property,
                context.preferences
            );
            score += preferencesScore * weights.preferences;
        }

        // Score based on search history
        if (context.searchHistory?.length) {
            const searchHistoryScore = this.calculateSearchHistoryScore(
                property,
                context.searchHistory
            );
            score += searchHistoryScore * weights.searchHistory;
        }

        // Score based on saved properties
        if (context.savedProperties?.length) {
            const savedPropertiesScore = this.calculateSavedPropertiesScore(
                property,
                context.savedProperties
            );
            score += savedPropertiesScore * weights.savedProperties;
        }

        return score;
    }

    private calculateTravelProfileScore(property: any, travelProfile: any) {
        let score = 0;

        // Score property type match
        if (travelProfile.preferredPropertyTypes?.includes(property.propertyType)) {
            score += 0.3;
        }

        // Score amenities match
        const mustHaveAmenities = travelProfile.mustHaveAmenities || [];
        const niceToHaveAmenities = travelProfile.niceToHaveAmenities || [];
        const propertyAmenities = property.amenities.map((a: any) => a.amenityId);

        const mustHaveMatch = mustHaveAmenities.filter((a: string) =>
            propertyAmenities.includes(a)
        ).length;
        const niceToHaveMatch = niceToHaveAmenities.filter((a: string) =>
            propertyAmenities.includes(a)
        ).length;

        score += (mustHaveMatch / mustHaveAmenities.length) * 0.4;
        score += (niceToHaveMatch / niceToHaveAmenities.length) * 0.2;

        // Score price range match
        if (
            travelProfile.budgetRangeMin &&
            travelProfile.budgetRangeMax &&
            property.basePrice >= travelProfile.budgetRangeMin &&
            property.basePrice <= travelProfile.budgetRangeMax
        ) {
            score += 0.1;
        }

        return score;
    }

    private calculatePreferencesScore(property: any, preferences: any[]) {
        let score = 0;

        for (const preference of preferences) {
            const weight = preference.preferenceWeight / 10; // Normalize weight to 0-1

            switch (preference.preferenceType) {
                case 'property_type':
                    if (property.propertyType === preference.preferenceValue) {
                        score += weight;
                    }
                    break;
                case 'location':
                    if (property.address.city === preference.preferenceValue) {
                        score += weight;
                    }
                    break;
                case 'amenities':
                    const preferredAmenities = preference.preferenceValue as string[];
                    const propertyAmenities = property.amenities.map(
                        (a: any) => a.amenityId
                    );
                    const matchCount = preferredAmenities.filter(a =>
                        propertyAmenities.includes(a)
                    ).length;
                    score += (matchCount / preferredAmenities.length) * weight;
                    break;
            }
        }

        return score / preferences.length; // Normalize to 0-1
    }

    private calculateSearchHistoryScore(property: any, searchHistory: any[]) {
        let score = 0;

        for (const search of searchHistory) {
            const searchParams = search.searchParams as any;

            // Score location match
            if (
                searchParams.location &&
                property.address.city.toLowerCase().includes(
                    searchParams.location.toLowerCase()
                )
            ) {
                score += 0.4;
            }

            // Score property type match
            if (
                searchParams.propertyType &&
                property.propertyType === searchParams.propertyType
            ) {
                score += 0.3;
            }

            // Score price range match
            if (
                searchParams.minPrice &&
                searchParams.maxPrice &&
                property.basePrice >= searchParams.minPrice &&
                property.basePrice <= searchParams.maxPrice
            ) {
                score += 0.3;
            }
        }

        return score / searchHistory.length; // Normalize to 0-1
    }

    private calculateSavedPropertiesScore(property: any, savedProperties: any[]) {
        let score = 0;

        for (const saved of savedProperties) {
            const savedProperty = saved.property;

            // Score property type match
            if (property.propertyType === savedProperty.propertyType) {
                score += 0.3;
            }

            // Score location match
            if (property.address.city === savedProperty.address.city) {
                score += 0.3;
            }

            // Score price range match
            const priceDiff = Math.abs(
                Number(property.basePrice) - Number(savedProperty.basePrice)
            );
            const maxPrice = Math.max(
                Number(property.basePrice),
                Number(savedProperty.basePrice)
            );
            if (maxPrice > 0) {
                score += (1 - priceDiff / maxPrice) * 0.4;
            }
        }

        return score / savedProperties.length; // Normalize to 0-1
    }

    private extractCommonLocations(searchHistory: any[]) {
        const locations = searchHistory
            .map(search => {
                const params = search.searchParams as any;
                return params.location;
            })
            .filter(Boolean);

        const locationCounts = locations.reduce((acc: any, location: string) => {
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(locationCounts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 3)
            .map(([location]) => location);
    }
} 