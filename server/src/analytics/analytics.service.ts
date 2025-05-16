import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    async getPropertyAnalytics(propertyId: string) {
        const views = await this.prisma.propertyView.count({
            where: {
                propertyId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }
        });

        const bookings = await this.prisma.booking.findMany({
            where: {
                propertyId,
                status: 'completed',
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const revenue = bookings.reduce((sum, booking) => {
            return sum + Number(booking.totalAmount);
        }, 0);

        const reviews = await this.prisma.review.findMany({
            where: {
                propertyId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                reviewer: true
            }
        });

        const searchLogs = await this.prisma.searchLog.findMany({
            where: {
                searchParams: {
                    path: ['propertyId'],
                    equals: propertyId
                },
                searchTimestamp: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            select: {
                searchTimestamp: true,
                searchParams: true,
                resultsCount: true
            }
        });

        return {
            views,
            bookings: bookings.length,
            revenue,
            reviews: reviews.length,
            averageRating: reviews.length > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                : 0,
            searchRankings: searchLogs.map(log => ({
                timestamp: log.searchTimestamp,
                params: log.searchParams,
                resultsCount: log.resultsCount
            }))
        };
    }

    async getUserAnalytics(userId: string) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                guestId: userId,
                status: 'completed',
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const totalSpent = bookings.reduce((sum, booking) => {
            return sum + Number(booking.totalAmount);
        }, 0);

        const searchLogs = await this.prisma.searchLog.findMany({
            where: {
                userId,
                searchTimestamp: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            select: {
                searchQuery: true,
                searchParams: true,
                resultsCount: true
            }
        });

        const preferences = await this.prisma.userPreference.findMany({
            where: {
                userId,
                preferenceType: {
                    not: null
                }
            }
        });

        return {
            bookings: bookings.length,
            totalSpent,
            searches: searchLogs.length,
            preferences: preferences.map(p => ({
                type: p.preferenceType,
                value: p.preferenceValue
            }))
        };
    }

    async getPlatformAnalytics() {
        const totalUsers = await this.prisma.user.count();
        const totalProperties = await this.prisma.property.count();
        const totalBookings = await this.prisma.booking.count({
            where: {
                status: 'completed'
            }
        });

        const recentBookings = await this.prisma.booking.findMany({
            where: {
                status: 'completed',
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const totalRevenue = recentBookings.reduce((sum, booking) => {
            return sum + Number(booking.totalAmount);
        }, 0);

        const searchStats = await this.prisma.searchLog.groupBy({
            by: ['searchSource'],
            _count: {
                _all: true
            }
        });

        return {
            totalUsers,
            totalProperties,
            totalBookings,
            monthlyRevenue: totalRevenue,
            searchStats: searchStats.map(stat => ({
                source: stat.searchSource,
                count: stat._count._all
            }))
        };
    }

    private getStartDate(timeRange: string): Date {
        const now = new Date();
        switch (timeRange) {
            case '7d':
                return new Date(now.setDate(now.getDate() - 7));
            case '30d':
                return new Date(now.setDate(now.getDate() - 30));
            case '90d':
                return new Date(now.setDate(now.getDate() - 90));
            case '1y':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(now.setDate(now.getDate() - 30));
        }
    }

    private async getPropertyViews(propertyId: string, startDate: Date) {
        return this.prisma.propertyView.count({
            where: {
                propertyId,
                createdAt: {
                    gte: startDate
                }
            }
        });
    }

    private async getPropertyBookings(propertyId: string, startDate: Date) {
        return this.prisma.booking.findMany({
            where: {
                propertyId,
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                guest: true
            }
        });
    }

    private async getPropertyRevenue(propertyId: string, startDate: Date) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                propertyId,
                createdAt: {
                    gte: startDate
                },
                status: 'completed'
            },
            select: {
                totalAmount: true
            }
        });

        return bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    }

    private async getPropertyReviews(propertyId: string, startDate: Date) {
        return this.prisma.review.findMany({
            where: {
                propertyId,
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                reviewer: true
            }
        });
    }

    private async getPropertySearchRankings(propertyId: string, startDate: Date) {
        return this.prisma.searchLog.findMany({
            where: {
                searchParams: {
                    path: ['propertyId'],
                    equals: propertyId
                },
                searchTimestamp: {
                    gte: startDate
                }
            },
            select: {
                searchTimestamp: true,
                searchParams: true,
                resultsCount: true
            }
        });
    }

    private calculatePerformanceMetrics(data: any) {
        const { views, bookings, revenue, reviews } = data;

        return {
            conversionRate: views > 0 ? (bookings.length / views) * 100 : 0,
            averageRating: reviews.length > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                : 0,
            revenuePerView: views > 0 ? revenue / views : 0,
            bookingValue: bookings.length > 0 ? revenue / bookings.length : 0
        };
    }

    private async getUserBookings(userId: string, startDate: Date) {
        return this.prisma.booking.findMany({
            where: {
                guestId: userId,
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                property: true
            }
        });
    }

    private async getUserSearches(userId: string, startDate: Date) {
        return this.prisma.searchLog.findMany({
            where: {
                userId,
                searchTimestamp: {
                    gte: startDate
                }
            }
        });
    }

    private async getUserSavedProperties(userId: string) {
        return this.prisma.savedProperty.findMany({
            where: { userId },
            include: {
                property: true
            }
        });
    }

    private async getUserPreferences(userId: string) {
        return this.prisma.userPreference.findMany({
            where: {
                userId,
                preferenceType: {
                    not: null
                }
            }
        });
    }

    private analyzeUserBehavior(data: any) {
        const { bookings, searches, savedProperties, preferences } = data;

        return {
            searchPatterns: this.analyzeSearchPatterns(searches),
            bookingPreferences: this.analyzeBookingPreferences(bookings),
            propertyInterests: this.analyzePropertyInterests(savedProperties),
            userPreferences: preferences
        };
    }

    private analyzeSearchPatterns(searches: any[]) {
        const patterns = {
            commonLocations: this.getCommonValues(searches, 'location'),
            commonDates: this.getCommonValues(searches, 'dates'),
            commonFilters: this.getCommonValues(searches, 'filters')
        };

        return {
            ...patterns,
            searchFrequency: this.calculateSearchFrequency(searches)
        };
    }

    private analyzeBookingPreferences(bookings: any[]) {
        return {
            preferredPropertyTypes: this.getCommonValues(bookings, 'property.propertyType'),
            preferredLocations: this.getCommonValues(bookings, 'property.location'),
            averageStayDuration: this.calculateAverageStayDuration(bookings),
            bookingFrequency: this.calculateBookingFrequency(bookings)
        };
    }

    private analyzePropertyInterests(savedProperties: any[]) {
        return {
            propertyTypes: this.getCommonValues(savedProperties, 'property.propertyType'),
            locations: this.getCommonValues(savedProperties, 'property.location'),
            priceRange: this.calculatePriceRange(savedProperties),
            amenities: this.getCommonAmenities(savedProperties)
        };
    }

    private getCommonValues(items: any[], path: string): string[] {
        const values = items.map(item => this.getNestedValue(item, path));
        return [...new Set(values)].filter(Boolean);
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    private calculateSearchFrequency(searches: any[]): number {
        if (searches.length === 0) return 0;
        const firstSearch = new Date(searches[0].searchTimestamp);
        const lastSearch = new Date(searches[searches.length - 1].searchTimestamp);
        const days = (lastSearch.getTime() - firstSearch.getTime()) / (1000 * 60 * 60 * 24);
        return days > 0 ? searches.length / days : 0;
    }

    private calculateAverageStayDuration(bookings: any[]): number {
        if (bookings.length === 0) return 0;
        return bookings.reduce((sum, booking) => {
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            return sum + (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / bookings.length;
    }

    private calculateBookingFrequency(bookings: any[]): number {
        if (bookings.length === 0) return 0;
        const firstBooking = new Date(bookings[0].createdAt);
        const lastBooking = new Date(bookings[bookings.length - 1].createdAt);
        const days = (lastBooking.getTime() - firstBooking.getTime()) / (1000 * 60 * 60 * 24);
        return days > 0 ? bookings.length / days : 0;
    }

    private calculatePriceRange(savedProperties: any[]): { min: number; max: number } {
        if (savedProperties.length === 0) return { min: 0, max: 0 };
        const prices = savedProperties.map(sp => sp.property.basePrice);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    private getCommonAmenities(savedProperties: any[]): string[] {
        const amenities = savedProperties.flatMap(sp =>
            sp.property.amenities.map(a => a.amenity.name)
        );
        return [...new Set(amenities)];
    }

    private async getTotalProperties() {
        return this.prisma.property.count({
            where: {
                deletedAt: null
            }
        });
    }

    private async getActiveProperties(startDate: Date) {
        return this.prisma.property.count({
            where: {
                deletedAt: null,
                status: 'active',
                updatedAt: {
                    gte: startDate
                }
            }
        });
    }

    private async getTotalBookings(startDate: Date) {
        return this.prisma.booking.count({
            where: {
                createdAt: {
                    gte: startDate
                }
            }
        });
    }

    private async getTotalRevenue(startDate: Date) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                createdAt: {
                    gte: startDate
                },
                status: 'completed'
            },
            select: {
                totalAmount: true
            }
        });

        return bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    }

    private async getUserGrowth(startDate: Date) {
        return this.prisma.user.count({
            where: {
                createdAt: {
                    gte: startDate
                }
            }
        });
    }

    private async getSearchMetrics(startDate: Date) {
        const searches = await this.prisma.searchLog.findMany({
            where: {
                searchTimestamp: {
                    gte: startDate
                }
            }
        });

        return {
            totalSearches: searches.length,
            averageResults: this.calculateAverageResults(searches),
            commonSearches: this.getCommonSearches(searches)
        };
    }

    private calculateAverageResults(searches: any[]): number {
        if (searches.length === 0) return 0;
        return searches.reduce((sum, search) =>
            sum + (search.resultsCount || 0), 0
        ) / searches.length;
    }

    private getCommonSearches(searches: any[]): any[] {
        const searchParams = searches.map(search => search.searchParams);
        const counts = searchParams.reduce((acc, params) => {
            const key = JSON.stringify(params);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([params, count]) => ({
                params: JSON.parse(params),
                count
            }))
            .sort((a, b) => (b.count as number) - (a.count as number))
            .slice(0, 10);
    }

    private calculateGrowthRate(current: number): number {
        // This would typically compare with previous period
        // For now, returning a placeholder
        return 0;
    }

    private calculateAverageBookingValue(totalBookings: number, totalRevenue: number): number {
        return totalBookings > 0 ? totalRevenue / totalBookings : 0;
    }

    private calculateUserMetrics(userGrowth: number) {
        // This would typically include more metrics
        // For now, returning basic metrics
        return {
            growth: userGrowth,
            activeUsers: userGrowth // This should be calculated differently
        };
    }
} 