// src/ai/tools/user-preferences.tool.ts
import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserPreferencesTool extends Tool {
    name = 'user-preferences';
    description = `
    Get or update user preferences. This tool can fetch the user's current preferences or store new preferences.
    
    For fetching preferences, input should be a JSON object with:
    {
      "action": "get",
      "userId": string // ID of the user
    }
    
    For updating preferences, input should be a JSON object with:
    {
      "action": "update",
      "userId": string, // ID of the user
      "preferences": {
        // Preference values to update
        "favoriteLocations": string[], // Optional array of preferred locations
        "preferredPropertyTypes": string[], // Optional array of preferred property types
        "preferredAmenities": string[], // Optional array of preferred amenities
        "budgetRange": { // Optional budget range
          "min": number,
          "max": number,
          "currency": string
        },
        "travelStyle": string, // Optional travel style (business, leisure, family, etc.)
        "mustHaveAmenities": string[] // Optional deal-breaker amenities
      }
    }
  `;

    constructor(private prisma: PrismaService) {
        super();
    }

    async _call(input: string): Promise<string> {
        try {
            const params = JSON.parse(input);
            const { action, userId } = params;

            if (!userId) {
                return JSON.stringify({
                    status: 'error',
                    message: 'Missing required parameter: userId',
                });
            }

            // Check if the user exists
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true },
            });

            if (!user) {
                return JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                });
            }

            // Handle the requested action
            if (action === 'get') {
                return await this.getUserPreferences(userId);
            } else if (action === 'update') {
                return await this.updateUserPreferences(userId, params.preferences);
            } else {
                return JSON.stringify({
                    status: 'error',
                    message: 'Invalid action. Use "get" or "update".',
                });
            }
        } catch (error) {
            console.error('Error in user preferences tool:', error);
            return JSON.stringify({
                status: 'error',
                message: error.message || 'Failed to process user preferences',
            });
        }
    }

    /**
     * Get user preferences from the database
     */
    private async getUserPreferences(userId: string): Promise<string> {
        // Get all preferences for the user
        const preferences = await this.prisma.userPreference.findMany({
            where: { userId },
            select: {
                preferenceType: true,
                preferenceValue: true,
                preferenceWeight: true,
            },
        });

        // Get travel profiles for more context
        const travelProfiles = await this.prisma.userTravelProfile.findMany({
            where: { userId },
            select: {
                profileName: true,
                travelerCount: true,
                includesChildren: true,
                childrenAges: true,
                includesPets: true,
                typicalStayLengthNights: true,
                budgetRangeMin: true,
                budgetRangeMax: true,
                preferredPropertyTypes: true,
                mustHaveAmenities: true,
                niceToHaveAmenities: true,
                preferredLocations: true,
                isDefault: true,
            },
        });

        // Get amenity preferences
        const amenityPreferences = await this.prisma.amenityPreference.findMany({
            where: { userId },
            select: {
                amenity: {
                    select: {
                        name: true,
                        category: true,
                    },
                },
                importanceScore: true,
            },
        });

        // Process preferences into a structured format
        const preferencesByType = preferences.reduce((acc: any, pref) => {
            acc[pref.preferenceType] = {
                value: pref.preferenceValue,
                weight: pref.preferenceWeight,
            };
            return acc;
        }, {});

        // Get booking history summary for preferences inference
        const bookingHistory = await this.prisma.booking.findMany({
            where: {
                guestId: userId,
                status: {
                    in: ['confirmed', 'completed'],
                },
            },
            select: {
                property: {
                    select: {
                        propertyType: true,
                        propertyName: true,
                        address: {
                            select: {
                                city: true,
                                country: true,
                            },
                        },
                    },
                },
                checkInDate: true,
                checkOutDate: true,
                numberOfGuests: true,
                totalAmount: true,
            },
            orderBy: {
                checkInDate: 'desc',
            },
            take: 5, // Get only recent bookings
        });

        // Format amenity preferences
        const formattedAmenityPreferences = amenityPreferences.map(ap => ({
            name: ap.amenity.name,
            category: ap.amenity.category,
            importance: ap.importanceScore,
        }));

        // Return combined preferences
        return JSON.stringify({
            status: 'success',
            preferences: preferencesByType,
            travelProfiles: travelProfiles.map(tp => ({
                ...tp,
                budgetRangeMin: tp.budgetRangeMin ? Number(tp.budgetRangeMin) : null,
                budgetRangeMax: tp.budgetRangeMax ? Number(tp.budgetRangeMax) : null,
            })),
            amenityPreferences: formattedAmenityPreferences,
            bookingHistory: bookingHistory.map(booking => ({
                propertyType: booking.property.propertyType,
                propertyName: booking.property.propertyName,
                location: booking.property.address[0] ?
                    `${booking.property.address[0].city}, ${booking.property.address[0].country}` :
                    'Unknown location',
                checkIn: booking.checkInDate.toISOString().split('T')[0],
                checkOut: booking.checkOutDate.toISOString().split('T')[0],
                guests: booking.numberOfGuests,
                totalAmount: Number(booking.totalAmount),
            })),
        });
    }

    /**
     * Update user preferences in the database
     */
    private async updateUserPreferences(
        userId: string,
        preferences: any
    ): Promise<string> {
        if (!preferences || Object.keys(preferences).length === 0) {
            return JSON.stringify({
                status: 'error',
                message: 'No preferences provided for update',
            });
        }

        try {
            // Start a transaction to ensure all updates succeed or fail together
            const result = await this.prisma.$transaction(async (tx) => {
                const updates = [];

                // Handle each preference type
                if (preferences.favoriteLocations) {
                    updates.push(
                        tx.userPreference.upsert({
                            where: {
                                userId_preferenceType: {
                                    userId,
                                    preferenceType: 'favoriteLocations',
                                },
                            },
                            update: {
                                preferenceValue: preferences.favoriteLocations,
                                preferenceWeight: 8, // High weight for explicit preferences
                            },
                            create: {
                                userId,
                                preferenceType: 'favoriteLocations',
                                preferenceValue: preferences.favoriteLocations,
                                preferenceWeight: 8,
                            },
                        })
                    );
                }

                if (preferences.preferredPropertyTypes) {
                    updates.push(
                        tx.userPreference.upsert({
                            where: {
                                userId_preferenceType: {
                                    userId,
                                    preferenceType: 'preferredPropertyTypes',
                                },
                            },
                            update: {
                                preferenceValue: preferences.preferredPropertyTypes,
                                preferenceWeight: 8,
                            },
                            create: {
                                userId,
                                preferenceType: 'preferredPropertyTypes',
                                preferenceValue: preferences.preferredPropertyTypes,
                                preferenceWeight: 8,
                            },
                        })
                    );
                }

                if (preferences.preferredAmenities) {
                    updates.push(
                        tx.userPreference.upsert({
                            where: {
                                userId_preferenceType: {
                                    userId,
                                    preferenceType: 'preferredAmenities',
                                },
                            },
                            update: {
                                preferenceValue: preferences.preferredAmenities,
                                preferenceWeight: 7,
                            },
                            create: {
                                userId,
                                preferenceType: 'preferredAmenities',
                                preferenceValue: preferences.preferredAmenities,
                                preferenceWeight: 7,
                            },
                        })
                    );
                }

                if (preferences.budgetRange) {
                    updates.push(
                        tx.userPreference.upsert({
                            where: {
                                userId_preferenceType: {
                                    userId,
                                    preferenceType: 'budgetRange',
                                },
                            },
                            update: {
                                preferenceValue: preferences.budgetRange,
                                preferenceWeight: 9,
                            },
                            create: {
                                userId,
                                preferenceType: 'budgetRange',
                                preferenceValue: preferences.budgetRange,
                                preferenceWeight: 9,
                            },
                        })
                    );
                }

                if (preferences.travelStyle) {
                    updates.push(
                        tx.userPreference.upsert({
                            where: {
                                userId_preferenceType: {
                                    userId,
                                    preferenceType: 'travelStyle',
                                },
                            },
                            update: {
                                preferenceValue: preferences.travelStyle,
                                preferenceWeight: 6,
                            },
                            create: {
                                userId,
                                preferenceType: 'travelStyle',
                                preferenceValue: preferences.travelStyle,
                                preferenceWeight: 6,
                            },
                        })
                    );
                }

                if (preferences.mustHaveAmenities) {
                    updates.push(
                        tx.userPreference.upsert({
                            where: {
                                userId_preferenceType: {
                                    userId,
                                    preferenceType: 'mustHaveAmenities',
                                },
                            },
                            update: {
                                preferenceValue: preferences.mustHaveAmenities,
                                preferenceWeight: 10, // Highest weight for must-haves
                            },
                            create: {
                                userId,
                                preferenceType: 'mustHaveAmenities',
                                preferenceValue: preferences.mustHaveAmenities,
                                preferenceWeight: 10,
                            },
                        })
                    );
                }

                // Execute all updates
                return await Promise.all(updates);
            });

            return JSON.stringify({
                status: 'success',
                message: 'User preferences updated successfully',
                updatedPreferences: Object.keys(preferences),
            });
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return JSON.stringify({
                status: 'error',
                message: 'Failed to update user preferences',
                error: error.message,
            });
        }
    }
}