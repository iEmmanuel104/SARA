import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
    constructor(private prisma: PrismaService) { }

    async create(createPropertyDto: any) {
        return this.prisma.property.create({
            data: createPropertyDto,
        });
    }

    async findAll() {
        return this.prisma.property.findMany();
    }

    async findOne(id: string) {
        return this.prisma.property.findUnique({
            where: { id },
        });
    }

    async update(id: string, updatePropertyDto: any) {
        return this.prisma.property.update({
            where: { id },
            data: updatePropertyDto,
        });
    }

    async remove(id: string) {
        return this.prisma.property.delete({
            where: { id },
        });
    }
} 