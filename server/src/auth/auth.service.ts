import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
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

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isHost: user.isHost,
                isAdmin: user.isAdmin,
            },
        };
    }

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await this.usersService.create({
            ...userData,
            passwordHash: hashedPassword,
        });

        return this.login(user);
    }

    async refreshToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.findById(payload.sub);

            if (!user) {
                throw new UnauthorizedException();
            }

            return this.login(user);
        } catch {
            throw new UnauthorizedException();
        }
    }
} 