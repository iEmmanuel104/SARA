import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Logo } from "@/components/ui/logo"
import { MessageSquare, Star, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />

            {/* Hero Section with Chat Focus */}
            <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 py-20 md:py-32">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
                                    Find Your Perfect Shortlet by Chatting with SARA
                                </h1>
                                <p className="max-w-[600px] text-gray-200 md:text-xl">
                                    Meet SARA, your AI rental assistant. Simply describe what you're looking for, and she'll find the
                                    perfect match for you.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Link href="/chat">
                                    <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        Chat with SARA
                                    </Button>
                                </Link>
                                <Link href="/explore">
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                        Browse Properties
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="w-full max-w-md overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Chat with SARA</h3>
                                        <p className="text-sm text-gray-200">Your AI rental assistant</p>
                                    </div>
                                </div>

                                {/* Chat Preview */}
                                <div className="space-y-4 mb-4">
                                    <div className="flex justify-start">
                                        <div className="rounded-lg bg-white/20 px-4 py-2 text-white max-w-[80%]">
                                            Hi! I'm SARA, your AI rental assistant. How can I help you find the perfect shortlet today?
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="rounded-lg bg-white/30 px-4 py-2 text-white max-w-[80%]">
                                            I need a 2-bedroom apartment in New York for next weekend.
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="rounded-lg bg-white/20 px-4 py-2 text-white max-w-[80%]">
                                            Great! I'll find some options for you. Do you have any preferences for location or amenities?
                                        </div>
                                    </div>
                                </div>

                                <Link href="/chat">
                                    <Button className="w-full bg-white text-purple-900 hover:bg-gray-100">Start Chatting</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Emphasizing Chat */}
            <section className="py-12 md:py-16 lg:py-20">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How SARA Works</h2>
                            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Finding your perfect shortlet is as easy as having a conversation.
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
                        {[
                            {
                                title: "Chat with SARA",
                                description:
                                    "Tell our AI assistant what you're looking for in natural language, just like texting a friend.",
                                icon: "💬",
                            },
                            {
                                title: "Get Personalized Matches",
                                description:
                                    "SARA understands your needs and suggests properties that match your specific requirements.",
                                icon: "🏠",
                            },
                            {
                                title: "Book with Confidence",
                                description: "Once you find the perfect place, SARA helps you complete your booking seamlessly.",
                                icon: "✅",
                            },
                        ].map((step, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-6 shadow-sm"
                            >
                                <div className="text-4xl">{step.icon}</div>
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="text-center text-gray-500">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Properties Section */}
            <section className="bg-gray-50 py-12 md:py-16 lg:py-20">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Properties</h2>
                            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Discover our handpicked selection of premium shortlet apartments.
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: "Coastal Retreat",
                                location: "Miami Beach",
                                price: "$350",
                                image: "/beachfront-villa.png",
                                id: "1",
                            },
                            {
                                title: "City Escape",
                                location: "New York",
                                price: "$150",
                                image: "/modern-city-apartment.png",
                                id: "2",
                            },
                            {
                                title: "Urban Apartment",
                                location: "San Francisco",
                                price: "$200",
                                image: "/luxury-urban-apartment.png",
                                id: "3",
                            },
                        ].map((property, index) => (
                            <Card key={index} className="overflow-hidden group">
                                <Link href={`/properties/${property.id}`}>
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={property.image || "/placeholder.svg"}
                                            alt={property.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg">{property.title}</h3>
                                        <div className="flex items-center mt-1 text-sm text-gray-500">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {property.location}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-bold text-purple-600">
                                                {property.price}
                                                <span className="text-sm font-normal">/night</span>
                                            </span>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <Link href="/explore">
                            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                                View All Properties
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-12 md:py-16 lg:py-20">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Hear from people who found their perfect stay with SARA.
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                quote: "SARA understood exactly what I was looking for and found me the perfect apartment in minutes!",
                                name: "Sarah Johnson",
                                location: "New York",
                                image: "/woman-portrait.png",
                            },
                            {
                                quote:
                                    "The chat interface made finding a rental so much easier than scrolling through endless listings.",
                                name: "Michael Chen",
                                location: "San Francisco",
                                image: "/thoughtful-man-portrait.png",
                            },
                            {
                                quote:
                                    "I was amazed at how personalized the recommendations were. SARA is like having a personal rental agent.",
                                name: "Emma Rodriguez",
                                location: "Miami",
                                image: "/woman-portrait-2.png",
                            },
                        ].map((testimonial, index) => (
                            <div key={index} className="flex flex-col space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                                <div className="flex-1">
                                    <p className="italic text-gray-600">"{testimonial.quote}"</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 overflow-hidden rounded-full">
                                        <img
                                            src={testimonial.image || "/placeholder.svg"}
                                            alt={testimonial.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 py-12 md:py-16 lg:py-20">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
                                Ready to Find Your Perfect Stay?
                            </h2>
                            <p className="max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Start chatting with SARA today and discover the easiest way to find your ideal shortlet.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/chat">
                                <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Chat with SARA
                                </Button>
                            </Link>
                            <Link href="/explore">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                    Browse Properties
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white py-6 md:py-8">
                <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
                    <div className="flex items-center gap-2">
                        <Logo size="small" />
                        <p className="text-sm text-gray-500">© 2024 Dwellr.xyz. All rights reserved.</p>
                    </div>
                    <nav className="flex gap-4 sm:gap-6">
                        <Link className="text-sm font-medium hover:underline" href="#">
                            Terms of Service
                        </Link>
                        <Link className="text-sm font-medium hover:underline" href="#">
                            Privacy Policy
                        </Link>
                        <Link className="text-sm font-medium hover:underline" href="#">
                            Contact
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
