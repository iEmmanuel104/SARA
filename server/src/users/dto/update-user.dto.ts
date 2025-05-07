import { IsEmail, IsString, IsOptional, IsBoolean, IsDate, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserDto {
    @ApiProperty({ example: 'john.doe@example.com', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: 'John', required: false })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({ example: '+1234567890', required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
    @IsString()
    @IsOptional()
    profilePictureUrl?: string;

    @ApiProperty({ example: '1990-01-01', required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dateOfBirth?: Date;

    @ApiProperty({ example: 'I love traveling!', required: false })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty({ example: 'en', required: false })
    @IsString()
    @IsOptional()
    preferredLanguage?: string;

    @ApiProperty({ example: 'USD', required: false })
    @IsString()
    @IsOptional()
    preferredCurrency?: string;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isHost?: boolean;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isVerified?: boolean;

    @ApiProperty({ example: { email: true, push: true, sms: false }, required: false })
    @IsObject()
    @IsOptional()
    notificationPreferences?: Record<string, boolean>;
} 