import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LocalizationService } from './localization.service';

@Module({
    imports: [ConfigModule],
    providers: [LocalizationService],
    exports: [LocalizationService],
})
export class LocalizationModule { } 