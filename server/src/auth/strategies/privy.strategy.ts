// src/auth/strategies/privy.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

/**
 * Passport strategy for Privy authentication
 * Validates Privy tokens and creates or retrieves the corresponding user
 */
@Injectable()
export class PrivyStrategy extends PassportStrategy(Strategy, 'privy') {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super();
    }

    /**
     * Validate the Privy token and find or create the user
     */
    async validate(req: any): Promise<any> {
        try {
            // Extract the Privy token from the Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return null;
            }

            const privyToken = authHeader.substring(7); // Remove 'Bearer ' prefix

            // Verify the Privy token using Privy's verification endpoint
            const verificationResult = await this.verifyPrivyToken(privyToken);

            if (!verificationResult) {
                return null;
            }

            const { userId: privyUserId, email, walletAddress } = verificationResult;

            // Check if the user exists by their Privy ID
            let user = await this.usersService.findByPrivyUserId(privyUserId);

            // If user doesn't exist but we have an email, try to find by email
            if (!user && email) {
                user = await this.usersService.findByEmail(email);
            }

            // If user still doesn't exist, create a new one
            if (!user) {
                const newUser = {
                    privyUserId,
                    email,
                    walletAddress,
                    firstName: email ? email.split('@')[0] : 'User', // Default first name
                    lastName: '',
                    // Set other default user properties
                };

                user = await this.usersService.create(newUser);
            } else if (
                // Update the user if needed
                (email && user.email !== email) ||
                (walletAddress && user.walletAddress !== walletAddress) ||
                (privyUserId && user.privyUserId !== privyUserId)
            ) {
                // Update with the latest info from Privy
                user = await this.usersService.update(user.id, {
                    privyUserId: privyUserId || user.privyUserId,
                    email: email || user.email,
                    walletAddress: walletAddress || user.walletAddress,
                });
            }

            return user;
        } catch (error) {
            console.error('Privy authentication error:', error);
            return null;
        }
    }

    /**
     * Verify the Privy token with the Privy API
     */
    private async verifyPrivyToken(token: string) {
        try {
            const privyApiKey = this.configService.get<string>('PRIVY_API_KEY');

            if (!privyApiKey) {
                throw new Error('PRIVY_API_KEY is not configured');
            }

            // Verify the token with Privy's API
            const response = await axios.post(
                'https://auth.privy.io/api/v1/verify',
                { token },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${privyApiKey}`,
                    },
                }
            );

            // Extract user information from the verified token
            const { user } = response.data;

            if (!user || !user.id) {
                throw new Error('Invalid user data in Privy token');
            }

            // Return the user information
            return {
                userId: user.id,
                email: user.email?.address,
                walletAddress: user.wallet?.address,
            };
        } catch (error) {
            console.error('Error verifying Privy token:', error);
            return null;
        }
    }
}