// src/ai/tools/property-search.tool.ts
import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PropertySearchTool extends Tool {
    name = 'property-search';
    description = `
    Search for properties based on specified criteria.
    Input should be a JSON object with search parameters:
    {
      "location": string, // City, neighborhood, or address
      "checkIn": string, // Check-in date (YYYY-MM-DD)
      "checkOut": string, // Check-out date (YYYY-MM-DD)
      "guests": number, // Number of guests
      "priceMin": number, // Minimum price per night (optional)
      "priceMax": number, // Maximum price per night (optional)
      "propertyTypes": string[], // List of property types, e.g. ["apartment", "house"] (optional)
      "amenities": string[], // List of required amenities (optional)
      "page": number, // Page number, starting from 1 (optional, default: 1)
      "pageSize": number // Number of results per page (optional, default: 5)
    }
  `;

    constructor(private prisma: PrismaService) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            const params = JSON.parse(input);
            const {
                location,
                checkIn,
                checkOut,
                guests,
                priceMin,
                priceMax,
                propertyTypes,
                amenities,
                page = 1,
                pageSize = 5,
            } = params;

            // Build the query conditions based on parameters
            const where: any = {
                status: 'active', // Only active properties
                deletedAt: null, // Not deleted
                capacityGuests: {
                    gte: guests || 1,
                },
            };

            // Add price range if provided
            if (priceMin !== undefined || priceMax !== undefined) {
                where.basePrice = {};
                if (priceMin !== undefined) {
                    where.basePrice.gte = priceMin;
                }
                if (priceMax !== undefined) {
                    where.basePrice.lte = priceMax;
                }
            }

            // Add property types if provided
            if (propertyTypes && propertyTypes.length > 0) {
                where.propertyType = {
                    in: propertyTypes,
                };
            }

            // Add location search if provided
            if (location) {
                // This is a simplified approach - in a real application,
                // you would use geocoding and radius search
                where.address = {
                    some: {
                        OR: [
                            { city: { contains: location, mode: 'insensitive' } },
                            { addressLine1: { contains: location, mode: 'insensitive' } },
                            { formattedAddress: { contains: location, mode: 'insensitive' } },
                        ],
                    },
                };
            }

            // Add availability check if dates are provided
            if (checkIn && checkOut) {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);

                // This is a simplified availability check
                // A more complex implementation would consider existing bookings and availability rules
                where.availability = {
                    every: {
                        date: {
                            gte: checkInDate,
                            lt: checkOutDate,
                        },
                        isAvailable: true,
                    },
                };
            }

            // Execute the query with pagination
            const [properties, totalCount] = await Promise.all([
                this.prisma.property.findMany({
                    where,
                    include: {
                        address: true,
                        host: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePictureUrl: true,
                                hostProfile: true,
                            },
                        },
                        images: {
                            take: 1,
                            orderBy: {
                                isCoverImage: 'desc',
                            },
                        },
                        amenities: {
                            include: {
                                amenity: true,
                            },
                        },
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    orderBy: {
                        averageRating: 'desc',
                    },
                }),
                this.prisma.property.count({ where }),
            ]);

            // Format the properties
            const formattedProperties = properties.map(property => ({
                id: property.id,
                name: property.propertyName,
                description: property.summary,
                type: property.propertyType,
                location: property.address[0] ?
                    `${property.address[0].city}, ${property.address[0].country}` :
                    'Location not specified',
                price: {
                    base: property.basePrice,
                    currency: property.currency,
                    cleaning: property.cleaningFee,
                    total: this.calculateTotalPrice(property, checkIn ? new Date(checkIn) : undefined, checkOut ? new Date(checkOut) : undefined),
                },
                capacity: {
                    guests: property.capacityGuests,
                    bedrooms: property.capacityBedrooms,
                    beds: property.capacityBeds,
                    bathrooms: property.capacityBathrooms,
                },
                amenities: property.amenities.map(a => a.amenity.name),
                rating: property.averageRating,
                reviewCount: property.totalReviews,
                image: property.images[0]?.imageUrl || null,
                host: {
                    id: property.host.id,
                    name: `${property.host.firstName} ${property.host.lastName}`,
                    isSuperhost: property.host.hostProfile?.isSuperhost || false,
                    profilePicture: property.host.profilePictureUrl,
                },
            }));

            // Return the results
            return JSON.stringify({
                status: 'success',
                properties: formattedProperties,
                pagination: {
                    total: totalCount,
                    page,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
            });
        } catch (error) {
            console.error('Error in property search tool:', error);
            return JSON.stringify({
                status: 'error',
                message: error.message || 'Failed to search properties',
            });
        }
    }

    /**
     * Calculate the total price for a property stay
     */
    private calculateTotalPrice(
        property: any,
        checkInDate?: Date,
        checkOutDate?: Date
    ): number {
        if (!checkInDate || !checkOutDate) {
            return Number(property.basePrice);
        }

        // Calculate number of nights
        const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate base cost
        const baseCost = Number(property.basePrice) * nights;

        // Add cleaning fee
        const totalCost = baseCost + Number(property.cleaningFee || 0);

        return totalCost;
    }
}