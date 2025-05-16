"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MapPin } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import "@/styles/animations.css"

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

    return (
        <div className="container px-4 py-8 md:px-6 md:py-12">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 animate-slide-down">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Explore Properties</h1>
                    <p className="text-gray-500">Find your perfect short-term rental</p>
                </div>
                <Link href="/chat">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover-scale">
                        <Search className="mr-2 h-4 w-4" />
                        Chat with SARA
                    </Button>
                </Link>
            </div>

            <div className="mt-6 animate-slide-up delay-200">
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
                            <Button variant="outline" className="flex items-center hover-scale">
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
                                className={`cursor-pointer transition-colors duration-200 ${
                                    activeFilters.includes("Apartment") ? "bg-purple-100" : ""
                                }`}
                                onClick={() => toggleFilter("Apartment")}
                            >
                                Apartment
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer transition-colors duration-200 ${
                                    activeFilters.includes("House") ? "bg-purple-100" : ""
                                }`}
                                onClick={() => toggleFilter("House")}
                            >
                                House
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer transition-colors duration-200 ${
                                    activeFilters.includes("Villa") ? "bg-purple-100" : ""
                                }`}
                                onClick={() => toggleFilter("Villa")}
                            >
                                Villa
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer transition-colors duration-200 ${
                                    activeFilters.includes("Studio") ? "bg-purple-100" : ""
                                }`}
                                onClick={() => toggleFilter("Studio")}
                            >
                                Studio
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`cursor-pointer transition-colors duration-200 ${
                                    activeFilters.includes("Condo") ? "bg-purple-100" : ""
                                }`}
                                onClick={() => toggleFilter("Condo")}
                            >
                                Condo
                            </Badge>
                        </div>

                        <TabsContent value="grid" className="mt-0">
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {filteredProperties.map((property, index) => (
                                    <div
                                        key={property.id}
                                        className="animate-slide-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <PropertyCard property={property} />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="map" className="mt-0">
                            <div className="h-[600px] rounded-lg border bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-4 text-lg font-medium">Map View Coming Soon</h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        We're working on bringing you an interactive map view
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="list" className="mt-0">
                            <div className="space-y-4">
                                {filteredProperties.map((property, index) => (
                                    <div
                                        key={property.id}
                                        className="animate-slide-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <PropertyCard property={property} variant="list" />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
