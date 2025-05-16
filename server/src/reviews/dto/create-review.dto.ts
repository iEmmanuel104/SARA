import { IsString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
    @IsString()
    @IsNotEmpty()
    bookingId: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsNotEmpty()
    comment: string;
} 