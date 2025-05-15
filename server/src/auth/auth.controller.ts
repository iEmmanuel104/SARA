// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrivyAuthGuard } from './guards/privy-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Req() req) {
        return this.authService.login(req.user);
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
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

    @UseGuards(PrivyAuthGuard)
    @Post('privy/login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login with Privy' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async privyLogin(@Req() req) {
        return this.authService.privyLogin(req.user);
    }
}