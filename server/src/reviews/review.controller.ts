import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @ApiOperation({ summary: 'Create a review for a booking' })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    createReview(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewService.createReview(createReviewDto);
    }

    @Get('property/:propertyId')
    @ApiOperation({ summary: 'Get reviews for a property' })
    @ApiResponse({ status: 200, description: 'Returns paginated reviews for the property' })
    getPropertyReviews(
        @Param('propertyId') propertyId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
        @Query('categories') categories?: string,
    ) {
        return this.reviewService.getPropertyReviews(propertyId, {
            page,
            limit,
            sortBy,
            sortOrder,
            categories: categories ? categories.split(',') : undefined,
        });
    }

    @Put(':id')
    updateReview(
        @Param('id') id: string,
        @Body() updateReviewDto: UpdateReviewDto,
    ) {
        return this.reviewService.updateReview(id, updateReviewDto);
    }

    @Delete(':id')
    deleteReview(@Param('id') id: string) {
        return this.reviewService.deleteReview(id);
    }

    @Get('host')
    @UseGuards(RolesGuard)
    @Roles('host')
    @ApiOperation({ summary: 'Get all reviews for host properties' })
    @ApiResponse({ status: 200, description: 'Returns aggregated reviews for all host properties' })
    async getHostReviews(@CurrentUser('id') userId: string) {
        return this.reviewService.getHostReviews(userId);
    }
} 