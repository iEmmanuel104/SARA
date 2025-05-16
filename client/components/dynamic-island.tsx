"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
            <motion.div
                initial={{ width: 480, height: 60, borderRadius: 30 }}
                animate={{
                    width: expanded ? "95%" : notification && showNotification ? 500 : 480,
                    height: expanded ? 350 : notification && showNotification ? 100 : 60,
                    borderRadius: expanded ? 24 : notification && showNotification ? 20 : 30,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative shadow-lg flex flex-col overflow-hidden"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Animated background with gradient and moving beams */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 z-0"
                    animate={{
                        background: pulseEffect
                            ? "linear-gradient(90deg, rgba(126,34,206,1) 0%, rgba(79,70,229,1) 100%)"
                            : "linear-gradient(90deg, rgba(88,28,135,1) 0%, rgba(67,56,202,1) 100%)",
                    }}
                    transition={{ duration: 1 }}
                >
                    {/* Animated beams */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute h-[200%] w-[10px] bg-white/10 blur-md"
                                style={{
                                    left: `${i * 20 + Math.random() * 10}%`,
                                    top: "-50%",
                                    transform: "rotate(35deg)",
                                }}
                                animate={{
                                    top: ["150%", "-150%"],
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 15,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "linear",
                                    delay: i * 2,
                                }}
                            />
                        ))}
                    </div>

                    {/* Glowing border effect */}
                    <motion.div
                        className="absolute inset-0 border border-white/20 rounded-[inherit] z-10"
                        animate={{
                            boxShadow: pulseEffect
                                ? [
                                    "0 0 0px 1px rgba(255,255,255,0.3) inset, 0 0 10px 1px rgba(139,92,246,0.5)",
                                    "0 0 0px 1px rgba(255,255,255,0.5) inset, 0 0 20px 2px rgba(139,92,246,0.8)",
                                    "0 0 0px 1px rgba(255,255,255,0.3) inset, 0 0 10px 1px rgba(139,92,246,0.5)",
                                ]
                                : "0 0 0px 1px rgba(255,255,255,0.3) inset, 0 0 10px 1px rgba(139,92,246,0.5)",
                        }}
                        transition={{ duration: 1 }}
                    />

                    {/* Particle effects */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            className="absolute rounded-full bg-white/30 w-1 h-1"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Collapsed state - Logo and navigation items */}
                <AnimatePresence mode="wait">
                    {!expanded && !showNotification && (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-between h-full px-6 relative z-20"
                        >
                            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                                <Logo size="small" />
                            </motion.div>

                            <div className="flex items-center space-x-6">
                                {isLoggedIn ? (
                                    // Logged in navigation
                                    <>
                                        <Link href="/dashboard">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <Home className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Home</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Home
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <Link href="/chat">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <MessageSquare className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Chat</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Chat
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <Link href="/explore">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <Search className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Explore</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Explore
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <Link href="/saved">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <Heart className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Saved</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Saved
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <Link href="/bookings">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <Calendar className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Bookings</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Bookings
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <motion.div
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex flex-col items-center justify-center group relative"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                <Menu className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-white text-xs mt-1 hidden md:block">Menu</span>
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                Menu
                                            </div>
                                        </motion.div>
                                    </>
                                ) : (
                                    // Not logged in navigation - fewer options
                                    <>
                                        <Link href="/chat">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <MessageSquare className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Chat</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Chat
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <Link href="/explore">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <Search className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Explore</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Explore
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <Link href="/signin">
                                            <motion.div
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center group relative"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                    <LogIn className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white text-xs mt-1 hidden md:block">Sign In</span>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                    Sign In
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <motion.div
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex flex-col items-center justify-center group relative"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                <Menu className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-white text-xs mt-1 hidden md:block">Menu</span>
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden whitespace-nowrap">
                                                Menu
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Notification state */}
                    {!expanded && showNotification && notification && (
                        <motion.div
                            key="notification"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center h-full px-6 py-2 relative z-20"
                        >
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm ${notification.type === "message"
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
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-white/70"
                                        animate={{
                                            opacity: [0.4, 1, 0.4],
                                            scale: [0.8, 1, 0.8],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Number.POSITIVE_INFINITY,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Expanded state - Full menu */}
                    {expanded && (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full p-6 relative z-20"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <Logo size="default" />
                                <motion.div
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setExpanded(false)
                                    }}
                                >
                                    <Menu className="h-5 w-5 text-white" />
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-2">
                                <Link href="/chat" onClick={(e) => e.stopPropagation()}>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-gradient-to-br from-purple-600/80 to-purple-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                    >
                                        <div className="relative">
                                            <MessageSquare className="h-8 w-8 text-white mb-2" />
                                            <motion.div
                                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.7, 1, 0.7],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                }}
                                            />
                                        </div>
                                        <span className="text-white text-sm font-medium">Chat</span>
                                    </motion.div>
                                </Link>

                                <Link href="/explore" onClick={(e) => e.stopPropagation()}>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-gradient-to-br from-indigo-600/80 to-indigo-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                    >
                                        <Search className="h-8 w-8 text-white mb-2" />
                                        <span className="text-white text-sm font-medium">Explore</span>
                                    </motion.div>
                                </Link>

                                <Link href="/saved" onClick={(e) => e.stopPropagation()}>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-gradient-to-br from-pink-600/80 to-pink-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                    >
                                        <Heart className="h-8 w-8 text-white mb-2" />
                                        <span className="text-white text-sm font-medium">Saved</span>
                                    </motion.div>
                                </Link>

                                {isLoggedIn ? (
                                    // Logged in expanded options
                                    <>
                                        <Link href="/profile" onClick={(e) => e.stopPropagation()}>
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                            >
                                                <User className="h-8 w-8 text-white mb-2" />
                                                <span className="text-white text-sm font-medium">Profile</span>
                                            </motion.div>
                                        </Link>

                                        <Link href="/bookings" onClick={(e) => e.stopPropagation()}>
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-br from-green-600/80 to-green-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                            >
                                                <Calendar className="h-8 w-8 text-white mb-2" />
                                                <span className="text-white text-sm font-medium">Bookings</span>
                                            </motion.div>
                                        </Link>

                                        <Link href="/settings" onClick={(e) => e.stopPropagation()}>
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-br from-gray-600/80 to-gray-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                            >
                                                <Settings className="h-8 w-8 text-white mb-2" />
                                                <span className="text-white text-sm font-medium">Settings</span>
                                            </motion.div>
                                        </Link>
                                    </>
                                ) : (
                                    // Not logged in expanded options
                                    <>
                                        <Link href="/signin" onClick={(e) => e.stopPropagation()}>
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                            >
                                                <LogIn className="h-8 w-8 text-white mb-2" />
                                                <span className="text-white text-sm font-medium">Sign In</span>
                                            </motion.div>
                                        </Link>

                                        <Link href="/signup" onClick={(e) => e.stopPropagation()}>
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-br from-green-600/80 to-green-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                            >
                                                <User className="h-8 w-8 text-white mb-2" />
                                                <span className="text-white text-sm font-medium">Sign Up</span>
                                            </motion.div>
                                        </Link>

                                        <Link href="/about" onClick={(e) => e.stopPropagation()}>
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-br from-gray-600/80 to-gray-800/80 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg"
                                            >
                                                <Sparkles className="h-8 w-8 text-white mb-2" />
                                                <span className="text-white text-sm font-medium">About</span>
                                            </motion.div>
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* AI Assistant quick access */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="mt-6 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded-xl p-4 backdrop-blur-sm border border-white/10"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-3">
                                        <Zap className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Ask SARA</h3>
                                        <p className="text-white/70 text-sm">Your AI rental assistant is ready to help</p>
                                    </div>
                                    <motion.div
                                        className="ml-auto bg-white/20 rounded-full px-3 py-1 text-white text-sm backdrop-blur-sm"
                                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                                    >
                                        Chat Now
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
