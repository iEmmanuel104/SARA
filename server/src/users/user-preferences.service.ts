import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserPreferencesService {
    private readonly logger = new Logger(UserPreferencesService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getUserPreferences(userId: string) {
        return this.prisma.userPreference.findMany({
            where: { userId }
        });
    }

    async updateUserPreference(
        userId: string,
        preferenceType: string,
        preferenceValue: any,
        preferenceWeight: number = 5
    ) {
        return this.prisma.userPreference.upsert({
            where: {
                userId_preferenceType: {
                    userId,
                    preferenceType
                }
            },
            update: {
                preferenceValue,
                preferenceWeight
            },
            create: {
                userId,
                preferenceType,
                preferenceValue,
                preferenceWeight
            }
        });
    }

    async getTravelProfiles(userId: string) {
        return this.prisma.userTravelProfile.findMany({
            where: { userId }
        });
    }

    async getDefaultTravelProfile(userId: string) {
        const profile = await this.prisma.userTravelProfile.findFirst({
            where: {
                userId,
                isDefault: true
            }
        });

        if (!profile) {
            throw new NotFoundException('Default travel profile not found');
        }

        return profile;
    }

    async createTravelProfile(
        userId: string,
        data: {
            profileName: string;
            preferredPropertyTypes?: string[];
            mustHaveAmenities?: string[];
            niceToHaveAmenities?: string[];
            budgetRangeMin?: number;
            budgetRangeMax?: number;
            isDefault?: boolean;
        }
    ) {
        const { isDefault, ...profileData } = data;

        // If this is set as default, unset any existing default profile
        if (isDefault) {
            await this.prisma.userTravelProfile.updateMany({
                where: {
                    userId,
                    isDefault: true
                },
                data: {
                    isDefault: false
                }
            });
        }

        return this.prisma.userTravelProfile.create({
            data: {
                userId,
                ...profileData,
                isDefault: isDefault ?? false
            }
        });
    }

    async updateTravelProfile(
        userId: string,
        profileId: string,
        data: {
            profileName?: string;
            preferredPropertyTypes?: string[];
            mustHaveAmenities?: string[];
            niceToHaveAmenities?: string[];
            budgetRangeMin?: number;
            budgetRangeMax?: number;
            isDefault?: boolean;
        }
    ) {
        const { isDefault, ...profileData } = data;

        // If this is set as default, unset any existing default profile
        if (isDefault) {
            await this.prisma.userTravelProfile.updateMany({
                where: {
                    userId,
                    isDefault: true,
                    id: { not: profileId }
                },
                data: {
                    isDefault: false
                }
            });
        }

        return this.prisma.userTravelProfile.update({
            where: {
                id: profileId,
                userId
            },
            data: {
                ...profileData,
                ...(isDefault !== undefined && { isDefault })
            }
        });
    }

    async deleteTravelProfile(userId: string, profileId: string) {
        return this.prisma.userTravelProfile.delete({
            where: {
                id: profileId,
                userId
            }
        });
    }

    async getAmenityPreferences(userId: string) {
        const preferences = await this.prisma.userPreference.findMany({
            where: {
                userId,
                preferenceType: 'amenities'
            }
        });

        return preferences.map(pref => ({
            amenityId: pref.preferenceValue as string,
            weight: pref.preferenceWeight
        }));
    }

    async updateAmenityPreferences(
        userId: string,
        amenities: Array<{ amenityId: string; weight: number }>
    ) {
        // Delete existing amenity preferences
        await this.prisma.userPreference.deleteMany({
            where: {
                userId,
                preferenceType: 'amenities'
            }
        });

        // Create new amenity preferences
        return this.prisma.userPreference.createMany({
            data: amenities.map(amenity => ({
                userId,
                preferenceType: 'amenities',
                preferenceValue: amenity.amenityId,
                preferenceWeight: amenity.weight
            }))
        });
    }
} 