// src/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', required: false })
    @IsString()
    @MinLength(8)
    @IsOptional()
    password?: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: '+1234567890', required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isHost?: boolean;

    @ApiProperty({ example: 'en', required: false })
    @IsString()
    @IsOptional()
    preferredLanguage?: string;

    @ApiProperty({ example: 'USD', required: false })
    @IsString()
    @IsOptional()
    preferredCurrency?: string;

    @ApiProperty({ example: '0x1234...', required: false })
    @IsString()
    @IsOptional()
    walletAddress?: string;

    @ApiProperty({ example: 'privy:123abc', required: false })
    @IsString()
    @IsOptional()
    privyUserId?: string;
}