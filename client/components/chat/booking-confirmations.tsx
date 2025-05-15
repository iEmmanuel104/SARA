"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, Check } from "lucide-react"

interface BookingConfirmationProps {
    booking: {
        propertyId: string
        checkIn: string
        checkOut: string
        guests: number
        totalPrice: string
        bookingId: string
    }
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
    // Format dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="mt-3 mb-3 overflow-hidden border-green-100">
                <CardHeader className="bg-green-50 pb-2">
                    <div className="flex items-center">
                        <div className="mr-2 rounded-full bg-green-100 p-1">
                            <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg font-medium text-green-800">Booking Confirmed</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500">Check-in</p>
                                <div className="flex items-center">
                                    <CalendarDays className="mr-1 h-3 w-3 text-gray-500" />
                                    <p className="font-medium">{formatDate(booking.checkIn)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Check-out</p>
                                <div className="flex items-center">
                                    <CalendarDays className="mr-1 h-3 w-3 text-gray-500" />
                                    <p className="font-medium">{formatDate(booking.checkOut)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Guests</p>
                            <div className="flex items-center">
                                <Users className="mr-1 h-3 w-3 text-gray-500" />
                                <p className="font-medium">{booking.guests} guests</p>
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">Total Price</p>
                                <p className="font-bold text-purple-600">{booking.totalPrice}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Booking ID: {booking.bookingId}</p>
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <Link href={`/bookings/${booking.bookingId}`} className="flex-1">
                                <Button size="sm" variant="outline" className="w-full">
                                    View Booking
                                </Button>
                            </Link>
                            <Link href={`/properties/${booking.propertyId}`} className="flex-1">
                                <Button size="sm" className="w-full">
                                    View Property
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
