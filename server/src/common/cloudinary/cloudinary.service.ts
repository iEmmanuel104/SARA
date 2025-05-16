import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse, UploadApiOptions } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(
        file: Express.Multer.File,
        options: {
            folder?: string;
            transformation?: any[];
            tags?: string[];
        } = {}
    ): Promise<UploadApiResponse> {
        try {
            return new Promise((resolve, reject) => {
                const uploadOptions: UploadApiOptions = {
                    folder: options.folder || 'sara',
                    resource_type: 'auto' as const,
                    transformation: options.transformation || [],
                    tags: options.tags || [],
                };

                cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(file.buffer);
            });
        } catch (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    async deleteImage(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }

    async getImageUrl(publicId: string, options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: number;
    } = {}): Promise<string> {
        try {
            const transformation = [];

            if (options.width) transformation.push({ width: options.width });
            if (options.height) transformation.push({ height: options.height });
            if (options.crop) transformation.push({ crop: options.crop });
            if (options.quality) transformation.push({ quality: options.quality });

            return cloudinary.url(publicId, {
                transformation,
                secure: true,
            });
        } catch (error) {
            throw new Error(`Failed to generate image URL: ${error.message}`);
        }
    }
} 