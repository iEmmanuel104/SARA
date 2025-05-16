import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { SecurityService } from './security.service';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
    ],
    providers: [SecurityService],
    exports: [SecurityService],
})
export class SecurityModule { } 