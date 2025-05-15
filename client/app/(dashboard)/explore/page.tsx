"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MapPin } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

// Sample property data
const properties = [
    {
        id: "1",
        title: "Luxe Apartment",
        location: "Los Angeles",
        price: "$200",
        rating: 5,
        image: "/luxury-apartment-interior.png",
        beds: 2,
        baths: 2,
        guests: 4,
        type: "Apartment",
        featured: true,
    },
    {
        id: "2",
        title: "Cozy Studio",
        location: "New York",
        price: "$150",
        rating: 4.5,
        image: "/cozy-studio-apartment.png",
        beds: 1,
        baths: 1,
        guests: 2,
        type: "Studio",
    },
    {
        id: "3",
        title: "Beachfront Villa",
        location: "Miami",
        price: "$350",
        rating: 5,
        image: "/beachfront-villa.png",
        beds: 3,
        baths: 2,
        guests: 6,
        type: "Villa",
        featured: true,
    },
    {
        id: "4",
        title: "Modern Loft",
        location: "San Francisco",
        price: "$250",
        rating: 4.8,
        image: "/modern-loft-apartment.png",
        beds: 2,
        baths: 2,
        guests: 4,
        type: "Loft",
    },
    {
        id: "5",
        title: "Downtown Condo",
        location: "Chicago",
        price: "$180",
        rating: 4.6,
        image: "/downtown-condo.png",
        beds: 1,
        baths: 1,
        guests: 3,
        type: "Condo",
    },
    {
        id: "6",
        title: "Charming House",
        location: "Austin",
        price: "$220",
        rating: 4.7,
        image: "/charming-house.png",
        beds: 3,
        baths: 2,
        guests: 5,
        type: "House",
    },
    {
        id: "7",
        title: "Luxury Penthouse",
        location: "New York",
        price: "$400",
        rating: 4.9,
        image: "/luxury-apartment-interior.png",
        beds: 3,
        baths: 3,
        guests: 6,
        type: "Penthouse",
    },
    {
        id: "8",
        title: "Seaside Cottage",
        location: "San Diego",
        price: "$190",
        rating: 4.5,
        image: "/charming-house.png",
        beds: 2,
        baths: 1,
        guests: 4,
        type: "Cottage",
    },
]

export default function Explore() {
    const [searchTerm, setSearchTerm] = useState("")
    const [priceRange, setPriceRange] = useState([100, 400])
    const [activeFilters, setActiveFilters] = useState<string[]>([])

    const toggleFilter = (filter: string) => {
        if (activeFilters.includes(filter)) {
            setActiveFilters(activeFilters.filter((f) => f !== filter))
        } else {
            setActiveFilters([...activeFilters, filter])
        }
    }

    // Filter properties based on search term and filters
    const filteredProperties = properties.filter((property) => {
        // Search term filter
        if (
            searchTerm &&
            !property.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !property.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
            return false
        }

        // Price range filter
        const price = Number.parseInt(property.price.replace("$", ""))
        if (price < priceRange[0] || price > priceRange[1]) {
            return false
        }

        // Type filters
        if (activeFilters.length > 0 && !activeFilters.includes(property.type)) {
            return false
        }

        return true
    })

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    return (
        <div className="container px-4 py-8 md:px-6 md:py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Explore Properties</h1>
                    <p className="text-gray-500">Find your perfect short-term rental</p>
                </div>
                <Link href="/chat">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                        <Search className="mr-2 h-4 w-4" />
                        Chat with SARA
                    </Button>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6"
            >
                <Tabs defaultValue="grid">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search by location, property type..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="flex items-center">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                        <TabsList>
                            <TabsTrigger value="grid">Grid</TabsTrigger>
                            <TabsTrigger value="map">Map</TabsTrigger>
                            <TabsTrigger value="list">List</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <div className="flex flex-wrap gap-2 mb-6">
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("Apartment") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("Apartment")}
                            >
                                Apartment
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("House") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("House")}
                            >
                                House
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("Villa") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("Villa")}
                            >
                                Villa
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("Studio") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("Studio")}
                            >
                                Studio
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("Condo") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("Condo")}
                            >
                                Condo
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("Loft") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("Loft")}
                            >
                                Loft
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("Penthouse") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("Penthouse")}
                            >
                                Penthouse
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer ${activeFilters.includes("Cottage") ? "bg-purple-100" : ""}`}
                                onClick={() => toggleFilter("Cottage")}
                            >
                                Cottage
                            </Badge>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-medium mb-2">
                                Price Range: ${priceRange[0]} - ${priceRange[1]}
                            </h3>
                            <Slider
                                defaultValue={[100, 400]}
                                max={500}
                                min={50}
                                step={10}
                                value={priceRange}
                                onValueChange={setPriceRange}
                            />
                        </div>
                    </div>

                    <TabsContent value="grid" className="mt-6">
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {filteredProperties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="map" className="mt-6">
                        <div className="rounded-lg border h-[600px] bg-gray-100 flex items-center justify-center">
                            <div className="text-center">
                                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Map View Coming Soon</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">
                                    We're working on an interactive map to help you find properties by location.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="list" className="mt-6">
                        <div className="space-y-4">
                            {filteredProperties.map((property) => (
                                <PropertyCard key={property.id} property={property} variant="compact" className="w-full" />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {filteredProperties.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-12 flex flex-col items-center justify-center py-12 text-center"
                >
                    <Search className="h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-xl font-medium">No properties found</h3>
                    <p className="mt-2 text-gray-500 max-w-md">
                        Try adjusting your search filters or explore different locations.
                    </p>
                    <Button
                        className="mt-6"
                        onClick={() => {
                            setSearchTerm("")
                            setPriceRange([100, 400])
                            setActiveFilters([])
                        }}
                    >
                        Reset Filters
                    </Button>
                </motion.div>
            )}
        </div>
    )
}
