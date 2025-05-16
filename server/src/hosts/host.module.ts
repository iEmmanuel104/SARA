import { Module } from '@nestjs/common';
import { HostService } from './host.service';
import { HostController } from './host.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AIModule } from '../ai/ai.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
    imports: [
        PrismaModule,
        AIModule,
        CloudinaryModule
    ],
    controllers: [HostController],
    providers: [HostService],
    exports: [HostService]
})
export class HostModule {} 