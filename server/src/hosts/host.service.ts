import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { Booking, Review } from '@prisma/client';

@Injectable()
export class HostService {
    private readonly logger = new Logger(HostService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AIService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    async getHostProfile(userId: string) {
        const host = await this.prisma.hostProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    include: {
                        propertyViews: {
                            include: {
                                property: true,
                            },
                        },
                    },
                },
            },
        });

        if (!host) {
            throw new NotFoundException('Host profile not found');
        }

        return host;
    }

    async getHostStats(userId: string) {
        const host = await this.prisma.hostProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    include: {
                        propertyViews: {
                            include: {
                                property: {
                                    include: {
                                        reviews: true,
                                        bookings: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!host) {
            throw new NotFoundException('Host profile not found');
        }

        const allReviews = host.user.propertyViews.flatMap(view => view.property.reviews);
        const allBookings = host.user.propertyViews.flatMap(view => view.property.bookings);

        return {
            totalProperties: host.user.propertyViews.length,
            totalReviews: allReviews.length,
            totalBookings: allBookings.length,
            averageRating: this.calculateAverageRating(allReviews),
            responseRate: host.responseRate,
            acceptanceRate: host.acceptanceRate,
            responseTimeMinutes: host.responseTimeMinutes,
        };
    }

    async searchProperties(userId: string) {
        const host = await this.prisma.hostProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    include: {
                        propertyViews: {
                            include: {
                                property: true,
                            },
                        },
                    },
                },
            },
        });

        if (!host) {
            throw new NotFoundException('Host profile not found');
        }

        return host.user.propertyViews.map(view => view.property);
    }

    async getHostInsights(userId: string) {
        const host = await this.prisma.hostProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    include: {
                        propertyViews: {
                            include: {
                                property: {
                                    include: {
                                        reviews: true,
                                        bookings: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!host) {
            throw new NotFoundException('Host profile not found');
        }

        const properties = host.user.propertyViews.map(view => view.property);
        const insights = await this.aiService.generateHostingTips({
            host,
            properties,
        });

        return insights;
    }

    private calculateAverageRating(reviews: Review[]): number {
        if (!reviews.length) return 0;
        return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }

    async getHostProperties(hostId: string) {
        return this.prisma.property.findMany({
            where: { hostId },
            include: {
                reviews: true,
                bookings: true,
                amenities: true,
                images: true,
                address: true,
            },
        });
    }

    async getHostBookings(hostId: string) {
        const properties = await this.prisma.property.findMany({
            where: { hostId },
            select: { id: true },
        });

        return this.prisma.booking.findMany({
            where: {
                propertyId: {
                    in: properties.map(p => p.id),
                },
            },
            include: {
                property: true,
                guest: true,
            },
        });
    }

    async getHostReviews(hostId: string) {
        const properties = await this.prisma.property.findMany({
            where: { hostId },
            select: { id: true },
        });

        return this.prisma.review.findMany({
            where: {
                propertyId: {
                    in: properties.map(p => p.id),
                },
            },
            include: {
                property: true,
                reviewer: true,
            },
        });
    }

    async getHostAnalytics(hostId: string) {
        const host = await this.prisma.hostProfile.findUnique({
            where: { id: hostId },
            include: {
                user: {
                    include: {
                        propertyViews: {
                            include: {
                                property: {
                                    include: {
                                        reviews: true,
                                        bookings: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!host) {
            throw new NotFoundException('Host not found');
        }

        const allReviews = host.user.propertyViews.flatMap(view => view.property.reviews);
        const allBookings = host.user.propertyViews.flatMap(view => view.property.bookings);

        return {
            totalProperties: host.user.propertyViews.length,
            totalReviews: allReviews.length,
            averageRating: this.calculateAverageRating(allReviews),
            totalBookings: allBookings.length,
            totalRevenue: this.calculateTotalRevenue(allBookings),
            occupancyRate: this.calculateOccupancyRate(allBookings),
            responseRate: host.responseRate,
            responseTime: host.responseTimeMinutes,
        };
    }

    private calculateTotalRevenue(bookings: Booking[]): number {
        return bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    }

    private calculateOccupancyRate(bookings: Booking[]): number {
        if (!bookings.length) return 0;
        const totalDays = bookings.reduce((sum, booking) => {
            const start = new Date(booking.checkInDate);
            const end = new Date(booking.checkOutDate);
            return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        return totalDays / (bookings.length * 30); // Assuming 30 days per month
    }

    async getAIPropertyInsights(propertyId: string) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                images: true,
                reviews: true,
                bookings: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                },
                address: true
            }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        return this.aiService.generatePropertyInsights({
            property,
            reviews: property.reviews,
            bookings: property.bookings,
            amenities: property.amenities.map(a => a.amenity)
        });
    }

    async getAIPricingRecommendation(propertyId: string) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                bookings: true,
                reviews: true,
                address: true
            }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        // Get market data for similar properties
        const marketData = await this.prisma.property.findMany({
            where: {
                propertyType: property.propertyType,
                address: {
                    some: {
                        city: property.address?.[0]?.city
                    }
                }
            },
            select: {
                basePrice: true,
                propertyType: true,
                address: true
            }
        });

        return this.aiService.generatePricingRecommendation({
            property,
            marketData,
            bookings: property.bookings,
            reviews: property.reviews
        });
    }

    async getAIHostingTips(hostId: string) {
        const host = await this.getHostProfile(hostId);
        if (!host) {
            throw new NotFoundException('Host not found');
        }

        return this.aiService.generateHostingTips({
            host,
            properties: host.user.propertyViews.map(view => view.property)
        });
    }

    async getAIPropertyImprovementSuggestions(propertyId: string) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                reviews: true,
                bookings: true,
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        return this.aiService.generatePropertyImprovementSuggestions({
            property,
            reviews: property.reviews,
            bookings: property.bookings,
            amenities: property.amenities.map(a => a.amenity)
        });
    }

    async addPropertyImage(propertyId: string, imageData: {
        imageUrl: string;
        roomType?: string;
        caption?: string;
        isCoverImage?: boolean;
        width: number;
        height: number;
        sizeBytes: number;
    }) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: { images: true }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        // If this is set as cover image, unset any existing cover images
        if (imageData.isCoverImage) {
            await this.prisma.propertyImage.updateMany({
                where: { propertyId },
                data: { isCoverImage: false }
            });
        }

        return this.prisma.propertyImage.create({
            data: {
                ...imageData,
                propertyId
            }
        });
    }

    async processHostChat(userId: string, message: string, sessionId: string) {
        const host = await this.getHostProfile(userId);
        if (!host) {
            throw new NotFoundException('Host not found');
        }

        // Get conversation history
        const conversation = await this.prisma.aiConversation.findUnique({
            where: { id: sessionId },
            include: { messages: true }
        });

        // Build context from host's properties and recent activity
        const context = {
            hostProfile: host,
            properties: host.user.propertyViews.map(view => view.property),
            recentBookings: await this.prisma.booking.findMany({
                where: { propertyId: { in: host.user.propertyViews.map(view => view.property.id) } },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            recentReviews: await this.prisma.review.findMany({
                where: { propertyId: { in: host.user.propertyViews.map(view => view.property.id) } },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        };

        // Process message with AI service
        const response = await this.aiService.processChatMessage(userId, message, {
            role: 'host',
            context,
            conversationHistory: conversation?.messages.map(msg => ({
                role: msg.messageRole as 'user' | 'assistant',
                content: msg.messageText
            })) || []
        });

        // Save message and response to conversation history
        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: userId,
                recipientId: 'system',
                messageText: message,
                messageType: 'user',
                isAutomated: false,
                isSystemMessage: false
            }
        });

        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: 'system',
                recipientId: userId,
                messageText: response,
                messageType: 'assistant',
                isAutomated: true,
                isSystemMessage: false
            }
        });

        return response;
    }
} 