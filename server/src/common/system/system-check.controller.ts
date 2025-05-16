// src/common/system/system-check.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemCheckService } from './system-check.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemCheckController {
    constructor(private readonly systemCheckService: SystemCheckService) { }

    @Get('health')
    @Roles(UserRole.ADMIN)
    async checkSystemHealth() {
        return this.systemCheckService.checkSystemHealth();
    }
} 