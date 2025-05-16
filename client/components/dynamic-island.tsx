"use client"

import { useState, useEffect } from "react"
import { Logo } from "@/components/ui/logo"
import {
    Bell,
    MessageSquare,
    Search,
    Menu,
    Home,
    Heart,
    User,
    Settings,
    Calendar,
    LogIn,
    Sparkles,
    Zap,
} from "lucide-react"
import Link from "next/link"
import "@/styles/animations.css"

type NotificationType = {
    id: string
    title: string
    message: string
    type: "message" | "alert" | "info"
}

interface DynamicIslandProps {
    isLoggedIn?: boolean
}

export function DynamicIsland({ isLoggedIn = false }: DynamicIslandProps) {
    const [expanded, setExpanded] = useState(false)
    const [notification, setNotification] = useState<NotificationType | null>(null)
    const [showNotification, setShowNotification] = useState(false)
    const [pulseEffect, setPulseEffect] = useState(false)

    // Demo notifications - in a real app, these would come from a backend
    useEffect(() => {
        if (isLoggedIn) {
            const notifications = [
                {
                    id: "1",
                    title: "New Match Found",
                    message: "SARA found a perfect property match for your search!",
                    type: "message" as const,
                },
                {
                    id: "2",
                    title: "Booking Confirmed",
                    message: "Your stay in Miami is confirmed!",
                    type: "alert" as const,
                },
            ]

            // Show a random notification after 3 seconds
            const timer = setTimeout(() => {
                const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
                setNotification(randomNotification)
                setShowNotification(true)

                // Hide notification after 5 seconds
                setTimeout(() => {
                    setShowNotification(false)
                }, 5000)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [isLoggedIn])

    // Create a pulsing effect every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPulseEffect(true)
            setTimeout(() => setPulseEffect(false), 1000)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
            <div
                className={`relative shadow-lg flex flex-col overflow-hidden transition-all duration-300 ease-out ${
                    expanded ? "w-[95%] rounded-3xl" : 
                    notification && showNotification ? "w-[500px] h-[100px] rounded-[20px]" : 
                    "w-[480px] h-[60px] rounded-[30px]"
                }`}
            >
                {/* Animated background with gradient and moving beams */}
                <div
                    className={`absolute inset-0 transition-colors duration-1000 ${
                        pulseEffect
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                            : "bg-gradient-to-r from-purple-900 to-indigo-900"
                    }`}
                >
                    {/* Animated beams */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-[200%] w-[10px] bg-white/10 blur-md animate-beam"
                                style={{
                                    left: `${i * 20 + Math.random() * 10}%`,
                                    top: "-50%",
                                    transform: "rotate(35deg)",
                                    animationDelay: `${i * 2}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Glowing border effect */}
                    <div
                        className={`absolute inset-0 border border-white/20 rounded-[inherit] z-10 ${
                            pulseEffect ? "animate-glow" : ""
                        }`}
                    />

                    {/* Particle effects */}
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={`particle-${i}`}
                            className="absolute rounded-full bg-white/30 w-1 h-1 animate-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Collapsed state - Logo and navigation items */}
                {!expanded && !showNotification && (
                    <div className="flex items-center justify-between h-full px-6 relative z-20 animate-fade-in">
                        <div className="hover-scale">
                            <Logo size="small" />
                        </div>

                        <div className="flex items-center space-x-6">
                            {isLoggedIn ? (
                                // Logged in navigation
                                <>
                                    <Link href="/dashboard">
                                        <div className="flex flex-col items-center justify-center group relative hover-lift">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                <Home className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-white text-xs mt-1 hidden md:block">Home</span>
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                Home
                                            </div>
                                        </div>
                                    </Link>

                                    <div
                                        className="flex flex-col items-center justify-center group relative hover-lift"
                                        onClick={() => setExpanded(true)}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Menu className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="text-white text-xs mt-1 hidden md:block">Menu</span>
                                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                            Menu
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Not logged in navigation
                                <>
                                    <div
                                        className="flex flex-col items-center justify-center group relative hover-lift"
                                        onClick={() => setExpanded(true)}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Menu className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="text-white text-xs mt-1 hidden md:block">Menu</span>
                                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                            Menu
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Notification state */}
                {!expanded && showNotification && notification && (
                    <div className="flex items-center h-full px-6 py-2 relative z-20 animate-slide-down">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm ${
                                notification.type === "message"
                                    ? "bg-purple-600/80"
                                    : notification.type === "alert"
                                    ? "bg-red-500/80"
                                    : "bg-blue-500/80"
                            }`}
                        >
                            {notification.type === "message" ? (
                                <MessageSquare className="h-6 w-6 text-white" />
                            ) : notification.type === "alert" ? (
                                <Bell className="h-6 w-6 text-white" />
                            ) : (
                                <Search className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-base font-medium">{notification.title}</h3>
                            <p className="text-white/80 text-sm">{notification.message}</p>
                        </div>

                        {/* Animated dots to indicate action */}
                        <div className="flex space-x-1 ml-2">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-white/70 animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Expanded state - Full menu */}
                {expanded && (
                    <div className="flex flex-col h-full p-6 relative z-20 overflow-y-auto animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <Logo size="default" />
                            <div
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover-scale"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setExpanded(false)
                                }}
                            >
                                <Menu className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-2 pb-6">
                            <Link href="/chat" onClick={(e) => e.stopPropagation()}>
                                <div className="bg-gradient-to-br from-purple-600/80 to-purple-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg hover-lift">
                                    <div className="relative">
                                        <MessageSquare className="h-8 w-8 text-white mb-2" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white animate-pulse" />
                                    </div>
                                    <span className="text-white text-sm font-medium">Chat</span>
                                </div>
                            </Link>

                            <Link href="/explore" onClick={(e) => e.stopPropagation()}>
                                <div className="bg-gradient-to-br from-indigo-600/80 to-indigo-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg hover-lift">
                                    <Search className="h-8 w-8 text-white mb-2" />
                                    <span className="text-white text-sm font-medium">Explore</span>
                                </div>
                            </Link>

                            <Link href="/saved" onClick={(e) => e.stopPropagation()}>
                                <div className="bg-gradient-to-br from-pink-600/80 to-pink-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg hover-lift">
                                    <Heart className="h-8 w-8 text-white mb-2" />
                                    <span className="text-white text-sm font-medium">Saved</span>
                                </div>
                            </Link>

                            {isLoggedIn ? (
                                // Logged in expanded options
                                <>
                                    <Link href="/profile" onClick={(e) => e.stopPropagation()}>
                                        <div className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg hover-lift">
                                            <User className="h-8 w-8 text-white mb-2" />
                                            <span className="text-white text-sm font-medium">Profile</span>
                                        </div>
                                    </Link>

                                    <Link href="/bookings" onClick={(e) => e.stopPropagation()}>
                                        <div className="bg-gradient-to-br from-green-600/80 to-green-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg hover-lift">
                                            <Calendar className="h-8 w-8 text-white mb-2" />
                                            <span className="text-white text-sm font-medium">Bookings</span>
                                        </div>
                                    </Link>

                                    <Link href="/settings" onClick={(e) => e.stopPropagation()}>
                                        <div className="bg-gradient-to-br from-gray-600/80 to-gray-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg hover-lift">
                                            <Settings className="h-8 w-8 text-white mb-2" />
                                            <span className="text-white text-sm font-medium">Settings</span>
                                        </div>
                                    </Link>
                                </>
                            ) : null}
                        </div>

                        {/* AI Assistant quick access */}
                        <div className="mt-6 mb-4 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover-scale">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-3">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Ask SARA</h3>
                                    <p className="text-white/70 text-sm">Your AI rental assistant is ready to help</p>
                                </div>
                                <Link href="/chat" onClick={(e) => e.stopPropagation()}>
                                    <div className="ml-auto bg-white/20 rounded-full px-3 py-1 text-white text-sm backdrop-blur-sm hover:bg-white/30 transition-colors duration-200">
                                        Chat Now
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
