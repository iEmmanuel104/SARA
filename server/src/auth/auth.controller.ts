// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrivyAuthGuard } from './guards/privy-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface WalletCredentials {
    walletId: string;
    authorizationPrivateKey: string;
    authorizationKeyId: string;
}

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService, private configService: ConfigService) { }

    @UseGuards(PrivyAuthGuard)
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login with Privy (supports email, social, and wallet login)' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Req() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Return the user profile' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getProfile(@Req() req) {
        return req.user;
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(@Body('token') token: string) {
        return this.authService.refreshToken(token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(200)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(
        @Req() req,
        @Body('refreshToken') refreshToken: string
    ) {
        return this.authService.logout(req.user.id, refreshToken);
    }

    @Post('update-wallet-credentials')
    @UseGuards(AuthGuard('jwt'))
    async updateWalletCredentials(@Body() credentials: WalletCredentials) {
        try {
            // Update .env file with new credentials
            const envPath = join(process.cwd(), '.env');
            const envContent = `
PRIVY_WALLET_ID=${credentials.walletId}
PRIVY_WALLET_AUTHORIZATION_PRIVATE_KEY=${credentials.authorizationPrivateKey}
PRIVY_WALLET_AUTHORIZATION_KEY_ID=${credentials.authorizationKeyId}
            `.trim();

            writeFileSync(envPath, envContent, { flag: 'a' });

            return {
                success: true,
                message: 'Wallet credentials updated successfully'
            };
        } catch (error) {
            console.error('Error updating wallet credentials:', error);
            throw error;
        }
    }
}