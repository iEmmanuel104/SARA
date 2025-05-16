"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Heart, Search, MessageSquare, ArrowRight } from "lucide-react"
import { ChatSearchBox } from "@/components/chat/chat-search-box"
import { PropertyCard } from "@/components/property-card"
import { DynamicIsland } from "@/components/dynamic-island"

// Sample property data
const featuredProperties = [
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
]

const savedProperties = [
    {
        id: "3",
        title: "Beachfront Villa",
        location: "Miami",
        price: "$350",
        rating: 5,
        image: "/beachfront-villa.png",
        saved: true,
    },
]

const upcomingBookings = [
    {
        id: "booking1",
        propertyId: "1",
        title: "Modern Loft",
        location: "New York",
        date: "May 12, 2024",
        status: "Upcoming",
        image: "/modern-loft-apartment.png",
    },
]

const chatHistory = [
    {
        id: "chat1",
        title: "Inquiry about Luxe Apartment",
        date: "May 5, 2024",
        preview: "Hi, I'm interested in the Luxe Apartment. Is it available?",
    },
    {
        id: "chat2",
        title: "Beachfront Villa Booking",
        date: "May 3, 2024",
        preview: "Regarding my booking for the Beachfront Villa...",
    },
]

export default function Dashboard() {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-100 to-purple-100 text-gray-900">
            {/* Pass isLoggedIn=true for the dashboard */}
            <DynamicIsland isLoggedIn={true} />

            <div className="container px-4 py-8 md:px-6 md:py-12 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500">Find your perfect stay with SARA, your AI rental assistant</p>
                    </div>
                </motion.div>

                {/* Main Chat Search Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8"
                >
                    <ChatSearchBox />
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <Link href="/explore">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center">
                                <div className="rounded-full bg-purple-100 p-3 mr-4">
                                    <Search className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Explore Properties</h3>
                                    <p className="text-sm text-gray-500">Browse all listings</p>
                                </div>
                                <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/saved">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center">
                                <div className="rounded-full bg-red-100 p-3 mr-4">
                                    <Heart className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Saved Properties</h3>
                                    <p className="text-sm text-gray-500">View your favorites</p>
                                </div>
                                <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/bookings">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center">
                                <div className="rounded-full bg-blue-100 p-3 mr-4">
                                    <CalendarDays className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Your Bookings</h3>
                                    <p className="text-sm text-gray-500">Manage reservations</p>
                                </div>
                                <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/chat">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center">
                                <div className="rounded-full bg-indigo-100 p-3 mr-4">
                                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Chat History</h3>
                                    <p className="text-sm text-gray-500">View past conversations</p>
                                </div>
                                <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Featured Properties */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Featured Properties</h2>
                        <Link href="/explore">
                            <Button variant="ghost" className="text-purple-600">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {featuredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} variant="featured" />
                        ))}
                    </div>
                </motion.div>

                {/* Dashboard Widgets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {/* Upcoming Bookings */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Upcoming Bookings</CardTitle>
                            <CardDescription>Your scheduled stays</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingBookings.length > 0 ? (
                                    upcomingBookings.map((booking) => (
                                        <div key={booking.id} className="flex items-center space-x-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-md">
                                                <img
                                                    src={booking.image || "/placeholder.svg"}
                                                    alt={booking.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium">{booking.title}</p>
                                                <p className="text-sm text-gray-500">{booking.location}</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <CalendarDays className="mr-1 h-3 w-3" />
                                                    {booking.date}
                                                </div>
                                            </div>
                                            <div className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                                {booking.status}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
                                        <h3 className="mt-2 font-medium">No upcoming bookings</h3>
                                        <p className="mt-1 text-sm text-gray-500">When you book a stay, it will appear here</p>
                                        <Link href="/explore">
                                            <Button className="mt-4" size="sm">
                                                Find a Place
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Saved Properties */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Saved Properties</CardTitle>
                            <CardDescription>Properties you've saved</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {savedProperties.length > 0 ? (
                                    savedProperties.map((property) => (
                                        <div key={property.id} className="flex items-center space-x-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-md">
                                                <img
                                                    src={property.image || "/placeholder.svg"}
                                                    alt={property.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium">{property.title}</p>
                                                <p className="text-sm text-gray-500">{property.location}</p>
                                                <p className="font-medium text-purple-600">{property.price}/night</p>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <Heart className="mx-auto h-10 w-10 text-gray-300" />
                                        <h3 className="mt-2 font-medium">No saved properties</h3>
                                        <p className="mt-1 text-sm text-gray-500">When you find properties you like, save them here</p>
                                        <Link href="/explore">
                                            <Button className="mt-4" size="sm">
                                                Explore Properties
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Chat Activity */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Recent Chat Activity</CardTitle>
                            <CardDescription>Your conversations with SARA</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {chatHistory.length > 0 ? (
                                    chatHistory.map((chat) => (
                                        <Link href={`/chat/${chat.id}`} key={chat.id}>
                                            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium">{chat.title}</p>
                                                        <p className="text-xs text-gray-500">{chat.date}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">{chat.preview}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
                                        <h3 className="mt-2 font-medium">No recent chats</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Start a conversation with SARA to get help finding your perfect stay
                                        </p>
                                        <Link href="/chat">
                                            <Button className="mt-4" size="sm">
                                                Chat with SARA
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
