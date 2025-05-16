import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, Prisma } from '@prisma/client';

@Injectable()
export class ReviewService {
    constructor(
        private prisma: PrismaService,
        private aiService: AIService,
    ) { }

    async createReview(data: CreateReviewDto) {
        const { bookingId, rating, comment } = data;

        // Get the booking to verify it exists and get property info
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                property: true,
            },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Analyze sentiment using AI
        const sentiment = await this.aiService.analyzeSentiment(comment);

        // Create the review
        const review = await this.prisma.review.create({
            data: {
                booking: {
                    connect: { id: bookingId }
                },
                property: {
                    connect: { id: booking.propertyId }
                },
                reviewer: {
                    connect: { id: booking.guestId }
                },
                reviewee: {
                    connect: { id: booking.property.hostId }
                },
                reviewType: 'GUEST_TO_HOST',
                rating,
                reviewText: comment,
                sentimentScore: sentiment.sentiment === 'positive' ? 1 : sentiment.sentiment === 'negative' ? -1 : 0,
            },
        });

        return review;
    }

    async getPropertyReviews(propertyId: string, options: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        categories?: string[];
    } = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            categories = [],
        } = options;

        const skip = (page - 1) * limit;

        const where: Prisma.ReviewWhereInput = {
            propertyId,
            ...(categories.length > 0 && {
                categories: {
                    hasSome: categories,
                },
            }),
        };

        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    booking: {
                        include: {
                            guest: true,
                        },
                    },
                },
            }),
            this.prisma.review.count({ where }),
        ]);

        return {
            reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
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
                reviewer: true,
                property: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getGuestReviews(guestId: string) {
        return this.prisma.review.findMany({
            where: { reviewerId: guestId },
            include: {
                property: true,
                reviewee: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateReview(id: string, data: UpdateReviewDto) {
        const { rating, comment } = data;

        // If comment is updated, analyze sentiment
        let sentimentScore;
        if (comment) {
            const sentiment = await this.aiService.analyzeSentiment(comment);
            sentimentScore = sentiment.sentiment === 'positive' ? 1 : sentiment.sentiment === 'negative' ? -1 : 0;
        }

        return this.prisma.review.update({
            where: { id },
            data: {
                rating,
                reviewText: comment,
                ...(sentimentScore !== undefined && { sentimentScore }),
            },
        });
    }

    async deleteReview(id: string) {
        return this.prisma.review.delete({
            where: { id },
        });
    }

    async getReviewStats(propertyId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { propertyId },
        });

        return {
            totalReviews: reviews.length,
            averageRating: this.calculateAverageRating(reviews),
            ratingDistribution: this.calculateRatingDistribution(reviews),
            categoryAverages: this.calculateCategoryAverages(reviews),
        };
    }

    private calculateAverageRating(reviews: Review[]): number {
        if (!reviews.length) return 0;
        return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }

    private calculateRatingDistribution(reviews: Review[]): Record<number, number> {
        const distribution: Record<number, number> = {};
        for (let i = 1; i <= 5; i++) {
            distribution[i] = reviews.filter(r => r.rating === i).length;
        }
        return distribution;
    }

    private calculateCategoryAverages(reviews: Review[]): Record<string, number> {
        const categories = [
            'cleanlinessRating',
            'communicationRating',
            'locationRating',
            'valueRating',
            'accuracyRating',
            'checkInRating',
        ];

        return categories.reduce((acc, category) => {
            acc[category] = reviews.reduce((sum, review) => sum + review[category], 0) / reviews.length;
            return acc;
        }, {} as Record<string, number>);
    }
} 