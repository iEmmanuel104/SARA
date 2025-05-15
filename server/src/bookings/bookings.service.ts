import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: any) {
    return this.prisma.booking.create({
      data: createBookingDto,
    });
  }

  async findAll() {
    return this.prisma.booking.findMany();
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateBookingDto: any) {
    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
    });
  }

  async remove(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }
} 