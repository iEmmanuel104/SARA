import { Controller, Get, Post, Param, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HostService } from './host.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@ApiTags('hosts')
@Controller('hosts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('host')
export class HostController {
    constructor(
        private readonly hostService: HostService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get host profile' })
    @ApiResponse({ status: 200, description: 'Returns the host profile with properties' })
    async getHostProfile(@CurrentUser('id') userId: string) {
        return this.hostService.getHostProfile(userId);
    }

    @Get('analytics')
    @ApiOperation({ summary: 'Get host analytics' })
    @ApiResponse({ status: 200, description: 'Returns analytics for all host properties' })
    async getHostAnalytics(@CurrentUser('id') userId: string) {
        return this.hostService.getHostAnalytics(userId);
    }

    @Get('properties/:propertyId/insights')
    @ApiOperation({ summary: 'Get AI-generated property insights' })
    @ApiResponse({ status: 200, description: 'Returns AI-generated insights for a property' })
    async getPropertyInsights(@Param('propertyId') propertyId: string) {
        return this.hostService.getAIPropertyInsights(propertyId);
    }

    @Get('properties/:propertyId/pricing-recommendation')
    @ApiOperation({ summary: 'Get AI-generated pricing recommendation' })
    @ApiResponse({ status: 200, description: 'Returns AI-generated pricing recommendation' })
    async getPricingRecommendation(@Param('propertyId') propertyId: string) {
        return this.hostService.getAIPricingRecommendation(propertyId);
    }

    @Get('hosting-tips')
    @ApiOperation({ summary: 'Get AI-generated hosting tips' })
    @ApiResponse({ status: 200, description: 'Returns AI-generated hosting tips' })
    async getHostingTips(@CurrentUser('id') userId: string) {
        return this.hostService.getAIHostingTips(userId);
    }

    @Get('properties/:propertyId/improvements')
    @ApiOperation({ summary: 'Get AI-generated property improvement suggestions' })
    @ApiResponse({ status: 200, description: 'Returns AI-generated improvement suggestions' })
    async getPropertyImprovements(@Param('propertyId') propertyId: string) {
        return this.hostService.getAIPropertyImprovementSuggestions(propertyId);
    }

    @Post('properties/:propertyId/images')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload property image' })
    @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
    async uploadPropertyImage(
        @Param('propertyId') propertyId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { roomType?: string; caption?: string; isCoverImage?: boolean }
    ) {
        const uploadResult = await this.cloudinaryService.uploadImage(file, {
            folder: `properties/${propertyId}`,
            tags: ['property', propertyId]
        });

        return this.hostService.addPropertyImage(propertyId, {
            imageUrl: uploadResult.url,
            roomType: body.roomType,
            caption: body.caption,
            isCoverImage: body.isCoverImage === true,
            width: uploadResult.width,
            height: uploadResult.height,
            sizeBytes: uploadResult.bytes
        });
    }

    @Post('chat')
    @ApiOperation({ summary: 'Process host chat message' })
    @ApiResponse({ status: 200, description: 'Returns AI response' })
    async processHostChat(
        @CurrentUser('id') userId: string,
        @Body() body: { message: string; sessionId: string }
    ) {
        return this.hostService.processHostChat(userId, body.message, body.sessionId);
    }
} 