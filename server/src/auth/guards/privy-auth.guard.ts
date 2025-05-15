// src/auth/guards/privy-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PrivyAuthGuard extends AuthGuard('privy') {
    constructor() {
        super();
    }

    /**
     * Override to customize the authentication logic
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Call the parent method to execute Privy authentication
        const result = (await super.canActivate(context)) as boolean;
        return result;
    }
}