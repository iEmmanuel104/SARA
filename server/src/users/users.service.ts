// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        return this.prisma.user.create({
            data: createUserDto,
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isHost: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find a user by their Privy user ID
     */
    async findByPrivyUserId(privyUserId: string) {
        return this.prisma.user.findFirst({
            where: { privyUserId },
        });
    }

    /**
     * Find a user by their wallet address
     */
    async findByWalletAddress(walletAddress: string) {
        return this.prisma.user.findFirst({
            where: { walletAddress },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.findById(id);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.user.delete({
            where: { id },
        });
    }

    async getHostProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                hostProfile: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isHost) {
            throw new ConflictException('User is not a host');
        }

        return user.hostProfile;
    }

    async updateHostProfile(userId: string, hostProfileData: any) {
        const user = await this.findById(userId);

        if (!user.isHost) {
            throw new ConflictException('User is not a host');
        }

        return this.prisma.hostProfile.upsert({
            where: { userId },
            update: hostProfileData,
            create: {
                ...hostProfileData,
                userId,
            },
        });
    }
}