import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class SecurityService {
    private readonly logger = new Logger(SecurityService.name);
    private readonly rateLimiter: RateLimiterMemory;
    private readonly encryptionKey: Buffer;
    private readonly encryptionIV: Buffer;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        // Initialize rate limiter
        this.rateLimiter = new RateLimiterMemory({
            points: 100, // Number of points
            duration: 60, // Per minute
        });

        // Initialize encryption
        const key = this.configService.get<string>('ENCRYPTION_KEY');
        const iv = this.configService.get<string>('ENCRYPTION_IV');

        if (!key || !iv) {
            throw new Error('Encryption key and IV must be provided');
        }

        this.encryptionKey = Buffer.from(key, 'hex');
        this.encryptionIV = Buffer.from(iv, 'hex');
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async checkRateLimit(ip: string): Promise<boolean> {
        try {
            await this.rateLimiter.consume(ip);
            return true;
        } catch (error) {
            return false;
        }
    }

    async encryptData(data: string): Promise<string> {
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            this.encryptionKey,
            this.encryptionIV
        );
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    async decryptData(encryptedData: string): Promise<string> {
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            this.encryptionKey,
            this.encryptionIV
        );
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async generateSecureToken(length: number = 32): Promise<string> {
        return crypto.randomBytes(length).toString('hex');
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const tokenRecord = await this.prisma.token.findUnique({
                where: { token },
            });

            if (!tokenRecord) {
                return false;
            }

            if (tokenRecord.expiresAt < new Date()) {
                await this.prisma.token.delete({
                    where: { id: tokenRecord.id },
                });
                return false;
            }

            return true;
        } catch (error) {
            this.logger.error(`Token validation error: ${error.message}`);
            return false;
        }
    }

    async logSecurityEvent(event: {
        userId?: string;
        action: string;
        ipAddress?: string;
        userAgent?: string;
        details?: any;
    }) {
        try {
            await this.prisma.securityLog.create({
                data: {
                    userId: event.userId,
                    action: event.action,
                    ipAddress: event.ipAddress,
                    userAgent: event.userAgent,
                    details: event.details,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to log security event: ${error.message}`);
        }
    }

    async getSecurityLogs(userId?: string) {
        return this.prisma.securityLog.findMany({
            where: userId ? { userId } : undefined,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    async validatePasswordStrength(password: string): Promise<{
        isValid: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async sanitizeInput(input: string): Promise<string> {
        // Remove potentially dangerous characters and patterns
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove on* event handlers
            .trim();
    }

    async validateEmail(email: string): Promise<boolean> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phoneNumber);
    }

    async generateCSRFToken(): Promise<string> {
        return this.generateSecureToken(32);
    }

    async validateCSRFToken(token: string, storedToken: string): Promise<boolean> {
        return token === storedToken;
    }

    async generateSessionId(): Promise<string> {
        return this.generateSecureToken(64);
    }

    async validateSession(token: string): Promise<boolean> {
        try {
            const session = await this.prisma.session.findUnique({
                where: { token },
            });

            if (!session) {
                return false;
            }

            if (session.expiresAt < new Date()) {
                await this.prisma.session.delete({
                    where: { id: session.id },
                });
                return false;
            }

            return true;
        } catch (error) {
            this.logger.error(`Session validation error: ${error.message}`);
            return false;
        }
    }

    getClientIp(request: Request): string {
        const forwardedFor = request.headers['x-forwarded-for'];
        if (typeof forwardedFor === 'string') {
            return forwardedFor.split(',')[0].trim();
        }
        return request.ip || request.socket.remoteAddress || '';
    }

    getUserAgent(request: Request): string {
        return request.headers['user-agent'] || '';
    }
} 