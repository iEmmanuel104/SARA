"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import {
    MapPin,
    Users,
    Bed,
    Bath,
    Home,
    Wifi,
    Tv,
    Coffee,
    Car,
    Star,
    Heart,
    MessageSquare,
    Share2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function PropertyDetail({ params }: { params: { id: string } }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isSaved, setIsSaved] = useState(false)
    const [checkInDate, setCheckInDate] = useState<string>("")
    const [checkOutDate, setCheckOutDate] = useState<string>("")
    const [guests, setGuests] = useState(1)

    // This would normally fetch data based on the ID
    const property = {
        id: params.id,
        title: "Modern Loft in Downtown",
        description:
            "Beautiful modern loft in the heart of downtown with stunning city views. This spacious apartment features high ceilings, large windows, and contemporary furnishings. Perfect for a weekend getaway or business trip.",
        longDescription: `
      This stunning modern loft is located in the heart of downtown, offering breathtaking city views and a prime location for exploring all the city has to offer.
      
      The space features high ceilings, large windows that flood the apartment with natural light, and contemporary furnishings that create a stylish and comfortable atmosphere.
      
      The open-concept living area includes a fully equipped kitchen with stainless steel appliances, a comfortable dining area, and a cozy living room with a smart TV and high-speed WiFi.
      
      The bedroom area offers a luxurious king-size bed with premium linens, and the modern bathroom features a walk-in shower with high-end fixtures.
      
      Additional amenities include a washer and dryer, air conditioning, and access to the building's fitness center and rooftop terrace.
      
      Perfect for a weekend getaway, a business trip, or an extended stay in the city.
    `,
        location: "New York",
        address: "123 Main Street, Downtown, New York, NY 10001",
        price: "$250",
        rating: 4.9,
        reviews: 128,
        guests: 4,
        bedrooms: 2,
        beds: 2,
        baths: 2,
        amenities: [
            { name: "Wifi", icon: Wifi },
            { name: "TV", icon: Tv },
            { name: "Kitchen", icon: Coffee },
            { name: "Parking", icon: Car },
            { name: "Air Conditioning", icon: Home },
            { name: "Washer/Dryer", icon: Home },
            { name: "Elevator", icon: Home },
            { name: "Gym", icon: Home },
        ],
        images: [
            "/modern-loft-living-room.png",
            "/modern-loft-bedroom.png",
            "/modern-loft-kitchen.png",
            "/modern-loft-bathroom.png",
            "/modern-loft-view.png",
        ],
        host: {
            name: "John Smith",
            image: "/thoughtful-man-portrait.png",
            rating: 4.8,
            responseRate: 98,
            responseTime: "within an hour",
        },
        reviews: [
            {
                id: "1",
                user: {
                    name: "Sarah Johnson",
                    image: "/woman-portrait.png",
                },
                rating: 5,
                date: "August 2023",
                comment: "Beautiful apartment with amazing views. Very clean and comfortable. Great location!",
            },
            {
                id: "2",
                user: {
                    name: "Michael Chen",
                    image: "/thoughtful-man-portrait.png",
                },
                rating: 4,
                date: "July 2023",
                comment: "Nice place, great host. The location is perfect for exploring the city.",
            },
            {
                id: "3",
                user: {
                    name: "Emma Rodriguez",
                    image: "/woman-portrait-2.png",
                },
                rating: 5,
                date: "June 2023",
                comment: "Stunning apartment! Everything was perfect. Will definitely stay here again.",
            },
        ],
    }

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.images.length) % property.images.length)
    }

    const calculateTotal = () => {
        if (!checkInDate || !checkOutDate) return 0

        const start = new Date(checkInDate)
        const end = new Date(checkOutDate)
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

        const basePrice = Number.parseInt(property.price.replace("$", "")) * nights
        const cleaningFee = 50
        const serviceFee = 30

        return basePrice + cleaningFee + serviceFee
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />

            <main className="flex-1">
                <div className="container px-4 py-8 md:px-6 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0"
                    >
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
                            <div className="mt-2 flex items-center space-x-4">
                                <div className="flex items-center">
                                    <MapPin className="mr-1 h-4 w-4 text-gray-500" />
                                    <span className="text-gray-500">{property.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{property.rating}</span>
                                    <span className="ml-1 text-gray-500">({property.reviews.length} reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" onClick={() => setIsSaved(!isSaved)}>
                                <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Share2 className="h-5 w-5" />
                            </Button>
                            <Link href="/chat">
                                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Ask SARA
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        <div className="col-span-full lg:col-span-2">
                            <div className="relative rounded-lg overflow-hidden">
                                <div className="aspect-[16/9] overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={currentImageIndex}
                                            src={property.images[currentImageIndex]}
                                            alt={`${property.title} - Image ${currentImageIndex + 1}`}
                                            className="h-full w-full object-cover"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </AnimatePresence>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                                    {property.images.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 w-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Tabs defaultValue="details">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="amenities">Amenities</TabsTrigger>
                                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                                        <TabsTrigger value="location">Location</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={property.host.image || "/placeholder.svg"}
                                                    alt={property.host.name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-medium">Hosted by {property.host.name}</h3>
                                                    <p className="text-sm text-gray-500">Response rate: {property.host.responseRate}%</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Contact Host
                                            </Button>
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold">About this space</h2>
                                            <p className="mt-2 text-gray-700 whitespace-pre-line">{property.longDescription}</p>
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold">Property Details</h2>
                                            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-5 w-5 text-gray-500" />
                                                    <span>{property.guests} guests</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Home className="h-5 w-5 text-gray-500" />
                                                    <span>{property.bedrooms} bedrooms</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Bed className="h-5 w-5 text-gray-500" />
                                                    <span>{property.beds} beds</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Bath className="h-5 w-5 text-gray-500" />
                                                    <span>{property.baths} baths</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="amenities">
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                            {property.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border">
                                                    <amenity.icon className="h-5 w-5 text-gray-500" />
                                                    <span>{amenity.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="reviews">
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-2">
                                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium text-lg">{property.rating}</span>
                                                <span className="text-gray-500">({property.reviews.length} reviews)</span>
                                            </div>

                                            <div className="space-y-4">
                                                {property.reviews.map((review) => (
                                                    <motion.div
                                                        key={review.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="border-b pb-4"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <img
                                                                src={review.user.image || "/placeholder.svg"}
                                                                alt={review.user.name}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                            <div>
                                                                <h4 className="font-medium">{review.user.name}</h4>
                                                                <p className="text-sm text-gray-500">{review.date}</p>
                                                            </div>
                                                            <div className="ml-auto flex items-center">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="ml-1 font-medium">{review.rating}</span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 text-gray-700">{review.comment}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="location">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium">Address</h3>
                                                <p className="text-gray-700">{property.address}</p>
                                            </div>

                                            <div className="aspect-[16/9] rounded-lg bg-gray-100 flex items-center justify-center">
                                                <div className="text-center">
                                                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium">Map View Coming Soon</h3>
                                                    <p className="text-gray-500 max-w-md mx-auto mt-2">
                                                        We're working on an interactive map to help you find the exact location.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        <div className="lg:row-start-1">
                            <Card className="sticky top-20">
                                <CardContent className="p-6 space-y-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {property.price}
                                            <span className="text-base font-normal">/night</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Check-in</label>
                                            <input
                                                type="date"
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={checkInDate}
                                                onChange={(e) => setCheckInDate(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Check-out</label>
                                            <input
                                                type="date"
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={checkOutDate}
                                                onChange={(e) => setCheckOutDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Guests</label>
                                        <select
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            value={guests}
                                            onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                                        >
                                            {[...Array(property.guests)].map((_, i) => (
                                                <option key={i} value={i + 1}>
                                                    {i + 1} {i === 0 ? "guest" : "guests"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Book Now</Button>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <span>Price</span>
                                            <span>{property.price}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span>Cleaning fee</span>
                                            <span>$50</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span>Service fee</span>
                                            <span>$30</span>
                                        </div>
                                        <div className="mt-4 border-t pt-4 font-bold">
                                            <div className="flex items-center justify-between">
                                                <span>Total</span>
                                                <span>${calculateTotal()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center text-sm text-gray-500">You won't be charged yet</div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
