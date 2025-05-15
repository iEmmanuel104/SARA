"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Bed, Bath } from "lucide-react"

interface PropertyRecommendationProps {
    property: {
        id: string
        title: string
        location: string
        price: string
        description: string
        image: string
        beds?: number
        baths?: number
        guests?: number
        type?: string
    }
}

export function PropertyRecommendation({ property }: PropertyRecommendationProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="mt-3 mb-3 overflow-hidden border-purple-100">
                <div className="aspect-video w-full overflow-hidden">
                    <img
                        src={property.image || "/placeholder.svg?height=200&width=400&query=apartment"}
                        alt={property.title}
                        className="h-full w-full object-cover"
                    />
                </div>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{property.title}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        {property.location}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{property.description}</p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        {property.guests && (
                            <div className="flex items-center">
                                <Users className="mr-1 h-3 w-3" />
                                <span>{property.guests} guests</span>
                            </div>
                        )}
                        {property.beds && (
                            <div className="flex items-center">
                                <Bed className="mr-1 h-3 w-3" />
                                <span>{property.beds} beds</span>
                            </div>
                        )}
                        {property.baths && (
                            <div className="flex items-center">
                                <Bath className="mr-1 h-3 w-3" />
                                <span>{property.baths} baths</span>
                            </div>
                        )}
                        {property.type && (
                            <div className="flex items-center">
                                <span>{property.type}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="font-bold text-purple-600">
                            {property.price}
                            <span className="text-sm font-normal">/night</span>
                        </div>
                        <div className="flex space-x-2">
                            <Link href={`/properties/${property.id}`}>
                                <Button size="sm" variant="outline">
                                    View Details
                                </Button>
                            </Link>
                            <Link href={`/properties/${property.id}/book`}>
                                <Button size="sm">Book Now</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
