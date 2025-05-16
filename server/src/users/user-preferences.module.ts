import { Module } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [UserPreferencesService],
    exports: [UserPreferencesService]
})
export class UserPreferencesModule { } 