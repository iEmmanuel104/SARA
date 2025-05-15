"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Star, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PropertyCardProps {
    property: {
        id: string
        title: string
        location: string
        price: string
        rating?: number
        reviews?: number
        image: string
        beds?: number
        baths?: number
        guests?: number
        type?: string
        featured?: boolean
        saved?: boolean
    }
    variant?: "default" | "compact" | "featured"
    className?: string
}

export function PropertyCard({ property, variant = "default", className }: PropertyCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isSaved, setIsSaved] = useState(property.saved || false)

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsSaved(!isSaved)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn("h-full", className)}
        >
            <Card className="overflow-hidden h-full">
                <div className="relative">
                    <Link href={`/properties/${property.id}`}>
                        <div className={cn("overflow-hidden", variant === "compact" ? "aspect-[4/3]" : "aspect-video")}>
                            <motion.img
                                src={property.image || "/placeholder.svg"}
                                alt={property.title}
                                className="h-full w-full object-cover"
                                animate={{ scale: isHovered ? 1.05 : 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 bg-white/80 hover:bg-white"
                        onClick={handleSaveClick}
                    >
                        <Heart className={cn("h-4 w-4", isSaved ? "fill-red-500 text-red-500" : "text-gray-600")} />
                    </Button>
                    {property.featured && (
                        <Badge className="absolute left-2 top-2 bg-gradient-to-r from-purple-600 to-indigo-600">Featured</Badge>
                    )}
                    {property.type && (
                        <Badge variant="outline" className="absolute left-2 bottom-2 bg-white/80">
                            {property.type}
                        </Badge>
                    )}
                </div>
                <CardContent className={cn("p-4", variant === "compact" ? "space-y-1" : "space-y-2")}>
                    <div className="flex items-center justify-between">
                        <h3 className={cn("font-semibold", variant === "compact" ? "text-base" : "text-lg")}>{property.title}</h3>
                        {property.rating && (
                            <div className="flex items-center">
                                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{property.rating}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        {property.location}
                    </div>

                    {variant !== "compact" && (
                        <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
                            {property.guests && (
                                <div className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" />
                                    <span>{property.guests} guests</span>
                                </div>
                            )}
                            {property.beds && (
                                <div className="flex items-center">
                                    <span>{property.beds} beds</span>
                                </div>
                            )}
                            {property.baths && (
                                <div className="flex items-center">
                                    <span>{property.baths} baths</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <div className="font-bold text-purple-600">
                            {property.price}
                            <span className="text-sm font-normal">/night</span>
                        </div>
                        <Link href={`/properties/${property.id}`}>
                            <Button size="sm" variant={variant === "featured" ? "default" : "outline"}>
                                View
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
