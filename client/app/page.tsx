"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DynamicIsland } from "@/components/dynamic-island"
import { Logo } from "@/components/ui/logo"
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

export default function Home() {
    const [currentBg, setCurrentBg] = useState(0)
    const { login, ready, authenticated } = usePrivy()
    const router = useRouter()
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

    // Redirect if already authenticated
    useEffect(() => {
        if (ready && authenticated) {
            router.push('/dashboard')
        }
    }, [ready, authenticated, router])

    const handleGetStarted = async () => {
        try {
            await login()
        } catch (error) {
            console.error('Login error:', error)
        }
    }

    return (
        <div className="flex min-h-screen flex-col relative">
            {/* Pass isLoggedIn=false for the homepage */}
            <DynamicIsland isLoggedIn={false} />

            {/* Animated Background Layer */}
            <div
                className="absolute inset-0 -z-10 transition-colors duration-1000"
                style={{
                    transition: "background 1s",
                }}
            >
                {/* Crossfade backgrounds using opacity layering */}
                {backgrounds.map((bg, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${bg}`}
                        style={{
                            opacity: idx === currentBg ? 1 : 0,
                            pointerEvents: "none",
                        }}
                    />
                ))}
            </div>

            {/* Hero Section with Content (no background animation here) */}
            <section className="relative min-h-screen flex items-center justify-center px-4 pt-24">
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
                        <div className="animate-slide-up">
                            <Logo size="large" />
                        </div>

                        <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl animate-slide-up delay-200">
                            Find your perfect stay with{" "}
                            <span className="relative inline-block">
                                AI
                                <span className="absolute -top-1 -right-3 text-xl animate-pulse">
                                    <Sparkles className="h-6 w-6 text-yellow-300" />
                                </span>
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-xl text-white animate-slide-up delay-400">
                            Meet SARA, your AI rental assistant. Just chat about what you're looking for, and she'll find the perfect match.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center animate-slide-up delay-600">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-100 text-lg font-medium shadow-lg hover-scale"
                                onClick={handleGetStarted}
                            >
                                Get Started
                            </Button>

                            <Link href="/chat" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full border-white text-white hover:bg-white/20 text-lg font-medium shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover-scale"
                                >
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Chat with SARA
                                </Button>
                            </Link>
                        </div>

                        {/* Chat Preview */}
                        <div className="mt-16 w-full max-w-md animate-slide-up delay-800">
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
                                    <Button className="w-full mt-4 bg-white/30 hover:bg-white/40 text-white border-0 shadow-md hover-scale">
                                        Continue Conversation
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
