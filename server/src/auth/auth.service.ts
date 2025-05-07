// src/auth/auth.service.ts (enhanced version)
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            roles: user.isAdmin ? ['admin'] : user.isHost ? ['host'] : ['user']
        };

        // Generate refresh token
        const refreshToken = uuidv4();

        // Store refresh token in database with expiration
        await this.prisma.userSession.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                userAgent: 'web',
                ipAddress: '0.0.0.0', // This should be passed from the controller
            },
        });

        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isHost: user.isHost,
                isAdmin: user.isAdmin,
                profilePictureUrl: user.profilePictureUrl,
            },
        };
    }

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        preferredLanguage?: string;
        preferredCurrency?: string;
    }) {
        // Check if user exists
        const existingUser = await this.usersService.findByEmail(userData.email);
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user with all provided fields
        const user = await this.prisma.user.create({
            data: {
                email: userData.email,
                passwordHash: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
                preferredLanguage: userData.preferredLanguage || 'en',
                preferredCurrency: userData.preferredCurrency || 'USD',
            },
        });

        return this.login(user);
    }

    async refreshToken(token: string) {
        // Find valid session
        const session = await this.prisma.userSession.findFirst({
            where: {
                refreshToken: token,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });

        if (!session) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Rotate refresh token
        const newRefreshToken = uuidv4();

        // Update session with new token
        await this.prisma.userSession.update({
            where: { id: session.id },
            data: {
                refreshToken: newRefreshToken,
                updatedAt: new Date(),
            },
        });

        // Generate new access token
        return this.login(session.user);
    }

    async logout(userId: string, refreshToken: string) {
        // Remove the session
        await this.prisma.userSession.deleteMany({
            where: {
                userId,
                refreshToken,
            },
        });

        return { success: true };
    }
}