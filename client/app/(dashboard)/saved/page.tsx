import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, Heart } from "lucide-react"

export default function SavedProperties() {
    return (
        <div className="container px-4 py-8 md:px-6 md:py-12">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Saved Properties</h1>
                    <p className="text-gray-500">Properties you've saved for later</p>
                </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[
                    {
                        id: 1,
                        title: "Beachfront Villa",
                        location: "Miami",
                        price: "$350",
                        rating: 5,
                        image: "/beachfront-villa.png",
                    },
                    {
                        id: 2,
                        title: "Modern Loft",
                        location: "San Francisco",
                        price: "$250",
                        rating: 4.8,
                        image: "/modern-loft-apartment.png",
                    },
                ].map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                        <div className="relative">
                            <Link href={`/properties/${property.id}`}>
                                <div className="aspect-video w-full overflow-hidden">
                                    <img
                                        src={property.image || "/placeholder.svg"}
                                        alt={property.title}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                </div>
                            </Link>
                            <Button variant="ghost" size="icon" className="absolute right-2 top-2 bg-white/80 hover:bg-white">
                                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            </Button>
                        </div>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{property.title}</h3>
                                    <div className="flex items-center">
                                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{property.rating}</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {property.location}
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="font-bold text-purple-600">
                                        {property.price}
                                        <span className="text-sm font-normal">/night</span>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        View
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty state */}
            {false && (
                <div className="mt-12 flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-xl font-medium">No saved properties yet</h3>
                    <p className="mt-2 text-gray-500 max-w-md">
                        When you find properties you like, save them here to easily find them later.
                    </p>
                    <Button className="mt-6" asChild>
                        <Link href="/explore">Explore Properties</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
