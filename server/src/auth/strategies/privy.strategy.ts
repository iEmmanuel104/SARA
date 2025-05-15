import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import axios from 'axios';

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
     * Supports all Privy authentication methods:
     * - Email/Password
     * - Social logins (Google, Apple, etc.)
     * - Wallet connections (Ethereum, Solana)
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

            const {
                userId: privyUserId,
                email,
                walletAddress,
                linkedAccounts,
                userMetadata
            } = verificationResult;

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
                    firstName: userMetadata?.firstName || email?.split('@')[0] || 'User',
                    lastName: userMetadata?.lastName || '',
                    phoneNumber: userMetadata?.phoneNumber,
                    preferredLanguage: userMetadata?.preferredLanguage || 'en',
                    preferredCurrency: userMetadata?.preferredCurrency || 'USD',
                    linkedAccounts: linkedAccounts || [],
                };

                user = await this.usersService.create(newUser);
            } else {
                // Update the user with latest Privy data
                const updates = {
                    privyUserId: privyUserId || user.privyUserId,
                    email: email || user.email,
                    walletAddress: walletAddress || user.walletAddress,
                    firstName: userMetadata?.firstName || user.firstName,
                    lastName: userMetadata?.lastName || user.lastName,
                    phoneNumber: userMetadata?.phoneNumber || user.phoneNumber,
                    preferredLanguage: userMetadata?.preferredLanguage || user.preferredLanguage,
                    preferredCurrency: userMetadata?.preferredCurrency || user.preferredCurrency,
                    linkedAccounts: linkedAccounts || user.linkedAccounts,
                };

                user = await this.usersService.update(user.id, updates);
            }

            return user;
        } catch (error) {
            console.error('Privy authentication error:', error);
            return null;
        }
    }

    private async verifyPrivyToken(token: string) {
        try {
            const response = await axios.get('https://auth.privy.io/api/v1/verify', {
                headers: {
                    'Authorization': `Bearer ${this.configService.get('PRIVY_APP_SECRET')}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    token,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error verifying Privy token:', error);
            return null;
        }
    }
}