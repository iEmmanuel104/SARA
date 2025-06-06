// src/ai/tools/booking-check.tool.ts
import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { PrismaService } from '../../prisma/prisma.service';
import { Action } from '@coinbase/agentkit';

@Injectable()
export class BookingCheckTool extends Tool implements Action {
    name = 'booking-check';
    description = `
    Check booking availability and status for properties.
    Input should be a JSON object with:
    {
      "propertyId": string, // Property ID to check
      "checkIn": string, // Check-in date (YYYY-MM-DD)
      "checkOut": string, // Check-out date (YYYY-MM-DD)
      "guests": number // Number of guests
    }
  `;

    constructor(private prisma: PrismaService) {
        super();
    }

    async execute(input: string): Promise<string> {
        return this._call(input);
    }

    protected async _call(input: string): Promise<string> {
        try {
            const { propertyId, checkIn, checkOut, guests } = JSON.parse(input);

            if (!propertyId || !checkIn || !checkOut) {
                return JSON.stringify({
                    status: 'error',
                    message: 'Missing required parameters: propertyId, checkIn, or checkOut',
                });
            }

            // Parse dates
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            // Validate dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                return JSON.stringify({
                    status: 'error',
                    message: 'Invalid date format. Please use YYYY-MM-DD.',
                });
            }

            if (checkInDate >= checkOutDate) {
                return JSON.stringify({
                    status: 'error',
                    message: 'Check-out date must be after check-in date.',
                });
            }

            // Get the property to check capacity and rules
            const property = await this.prisma.property.findUnique({
                where: { id: propertyId },
                select: {
                    id: propertyId,
                    capacityGuests: true,
                    minNights: true,
                    maxNights: true,
                    basePrice: true,
                    cleaningFee: true,
                    currency: true,
                    status: true,
                },
            });

            if (!property) {
                return JSON.stringify({
                    status: 'error',
                    message: 'Property not found',
                });
            }

            if (property.status !== 'active') {
                return JSON.stringify({
                    status: 'error',
                    message: 'This property is not currently available for booking',
                });
            }

            // Check guest capacity
            if (guests > property.capacityGuests) {
                return JSON.stringify({
                    status: 'unavailable',
                    message: `This property can only accommodate ${property.capacityGuests} guests.`,
                    property: {
                        id: property.id,
                        capacityGuests: property.capacityGuests,
                    },
                });
            }

            // Calculate number of nights
            const nightsCount = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Check minimum and maximum nights
            if (nightsCount < property.minNights) {
                return JSON.stringify({
                    status: 'unavailable',
                    message: `This property requires a minimum stay of ${property.minNights} nights.`,
                    property: {
                        id: property.id,
                        minNights: property.minNights,
                    },
                });
            }

            if (property.maxNights && nightsCount > property.maxNights) {
                return JSON.stringify({
                    status: 'unavailable',
                    message: `This property has a maximum stay of ${property.maxNights} nights.`,
                    property: {
                        id: property.id,
                        maxNights: property.maxNights,
                    },
                });
            }

            // Generate an array of dates to check availability
            const datesToCheck: Date[] = [];
            let currentDate = new Date(checkInDate);
            while (currentDate < checkOutDate) {
                datesToCheck.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Check availability for each date
            const unavailableDates = await this.prisma.propertyAvailability.findMany({
                where: {
                    propertyId,
                    date: {
                        in: datesToCheck,
                    },
                    isAvailable: false,
                },
                select: {
                    date: true,
                },
            });

            // Check existing bookings for the same dates
            const existingBookings = await this.prisma.booking.findMany({
                where: {
                    propertyId,
                    status: {
                        in: ['pending', 'confirmed'],
                    },
                    OR: [
                        {
                            // Bookings that start during our period
                            checkInDate: {
                                gte: checkInDate,
                                lt: checkOutDate,
                            },
                        },
                        {
                            // Bookings that end during our period
                            checkOutDate: {
                                gt: checkInDate,
                                lte: checkOutDate,
                            },
                        },
                        {
                            // Bookings that completely contain our period
                            AND: [
                                {
                                    checkInDate: {
                                        lte: checkInDate,
                                    },
                                },
                                {
                                    checkOutDate: {
                                        gte: checkOutDate,
                                    },
                                },
                            ],
                        },
                    ],
                },
                select: {
                    checkInDate: true,
                    checkOutDate: true,
                },
            });

            if (unavailableDates.length > 0 || existingBookings.length > 0) {
                // Find the next available dates
                const nextAvailability = await this.findNextAvailability(
                    propertyId,
                    checkOutDate,
                    nightsCount,
                    property.maxNights || 365
                );

                return JSON.stringify({
                    status: 'unavailable',
                    message: 'The property is not available for the selected dates.',
                    nextAvailability,
                });
            }

            // Calculate the price
            const baseTotal = Number(property.basePrice) * nightsCount;
            const cleaningFee = Number(property.cleaningFee || 0);
            const totalPrice = baseTotal + cleaningFee;

            return JSON.stringify({
                status: 'available',
                message: 'The property is available for the selected dates.',
                booking: {
                    propertyId,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    nights: nightsCount,
                    guests: guests,
                    pricing: {
                        basePrice: property.basePrice,
                        baseTotal: baseTotal,
                        cleaningFee: property.cleaningFee,
                        total: totalPrice,
                        currency: property.currency,
                    },
                },
            });
        } catch (error) {
            console.error('Error in booking availability check:', error);
            return JSON.stringify({
                status: 'error',
                message: error.message || 'Failed to check availability',
            });
        }
    }

    /**
     * Find the next available date range for a property
     */
    private async findNextAvailability(
        propertyId: string,
        startDate: Date,
        nightsCount: number,
        maxNights: number
    ) {
        // Implementation would search for the next available date range
        // This is a simplified version that suggests dates 7 days later
        const suggestedCheckIn = new Date(startDate);
        suggestedCheckIn.setDate(suggestedCheckIn.getDate() + 7);

        const suggestedCheckOut = new Date(suggestedCheckIn);
        suggestedCheckOut.setDate(suggestedCheckOut.getDate() + nightsCount);

        return {
            suggestedCheckIn: suggestedCheckIn.toISOString().split('T')[0],
            suggestedCheckOut: suggestedCheckOut.toISOString().split('T')[0],
            nights: nightsCount,
        };
    }
}