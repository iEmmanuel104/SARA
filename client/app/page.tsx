"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DynamicIsland } from "@/components/dynamic-island"
import { Logo } from "@/components/ui/logo"
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
    const [currentBg, setCurrentBg] = useState(0)
    const backgrounds = [
        "bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-400",
        "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-400",
        "bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-400",
    ]

    // Cycle through backgrounds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgrounds.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex min-h-screen flex-col">
            {/* Pass isLoggedIn=false for the homepage */}
            <DynamicIsland isLoggedIn={false} />

            {/* Hero Section with Animated Background */}
            <AnimatePresence mode="wait">
                <motion.section
                    key={currentBg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={`relative min-h-screen flex items-center justify-center ${backgrounds[currentBg]} px-4 pt-24`}
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 opacity-30">
                            {/* Abstract pattern overlay */}
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-white"
                                    style={{
                                        width: Math.random() * 300 + 50,
                                        height: Math.random() * 300 + 50,
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                    initial={{ opacity: 0.1 }}
                                    animate={{
                                        opacity: [0.1, 0.3, 0.1],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: Math.random() * 5 + 5,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: "reverse",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="container relative z-10 mx-auto max-w-5xl">
                        <div className="flex flex-col items-center text-center">
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                                <Logo size="large" />
                            </motion.div>

                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
                            >
                                Find your perfect stay with{" "}
                                <span className="relative inline-block">
                                    AI
                                    <motion.span
                                        className="absolute -top-1 -right-3 text-xl"
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0.8, 1.2, 0.8],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Number.POSITIVE_INFINITY,
                                        }}
                                    >
                                        <Sparkles className="h-6 w-6 text-yellow-300" />
                                    </motion.span>
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="mt-6 max-w-2xl text-xl text-white"
                            >
                                Meet SARA, your AI rental assistant. Just chat about what you're looking for, and she'll find the
                                perfect match.
                            </motion.p>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center"
                            >
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-100 text-lg font-medium shadow-lg"
                                >
                                    Get Started
                                </Button>

                                <Link href="/chat" className="w-full sm:w-auto">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full border-white text-white hover:bg-white/20 text-lg font-medium shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600"
                                    >
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        Chat with SARA
                                    </Button>
                                </Link>
                            </motion.div>

                            {/* Chat Preview */}
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="mt-16 w-full max-w-md"
                            >
                                <div className="rounded-2xl bg-white/20 backdrop-blur-md p-6 border border-white/30 shadow-xl">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">SARA</h3>
                                            <p className="text-xs text-white/80">AI Rental Assistant</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="rounded-lg bg-white/30 px-4 py-2 text-white">
                                            Hi! I'm SARA, your AI rental assistant. How can I help you find the perfect place?
                                        </div>

                                        <div className="rounded-lg bg-white/40 px-4 py-2 text-white ml-auto max-w-[80%]">
                                            I need a beachfront apartment in Miami for next weekend.
                                        </div>

                                        <div className="rounded-lg bg-white/30 px-4 py-2 text-white">
                                            Great choice! I'll find some amazing beachfront options in Miami. Any specific requirements?
                                        </div>
                                    </div>

                                    <Link href="/chat">
                                        <Button className="w-full mt-4 bg-white/30 hover:bg-white/40 text-white border-0 shadow-md">
                                            Continue Conversation
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </AnimatePresence>
        </div>
    )
}
