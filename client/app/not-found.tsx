"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-4">
            <div className="relative max-w-2xl w-full">
                {/* Animated background with gradient and moving beams */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl overflow-hidden"
                    animate={{
                        background: [
                            "linear-gradient(90deg, rgba(88,28,135,1) 0%, rgba(67,56,202,1) 100%)",
                            "linear-gradient(90deg, rgba(126,34,206,1) 0%, rgba(79,70,229,1) 100%)",
                            "linear-gradient(90deg, rgba(88,28,135,1) 0%, rgba(67,56,202,1) 100%)",
                        ],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
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
                        className="absolute inset-0 border border-white/20 rounded-[inherit]"
                        animate={{
                            boxShadow: [
                                "0 0 0px 1px rgba(255,255,255,0.3) inset, 0 0 10px 1px rgba(139,92,246,0.5)",
                                "0 0 0px 1px rgba(255,255,255,0.5) inset, 0 0 20px 2px rgba(139,92,246,0.8)",
                                "0 0 0px 1px rgba(255,255,255,0.3) inset, 0 0 10px 1px rgba(139,92,246,0.5)",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>

                {/* Content */}
                <div className="relative z-10 p-12 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
                        <h2 className="text-2xl text-white/90 mb-8">Page Not Found</h2>
                        <p className="text-white/70 mb-12 max-w-md mx-auto">
                            Oops! The page you're looking for seems to have vanished into thin air.
                            Let's get you back on track.
                        </p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white border border-white/10 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </motion.button>

                        <Link href="/">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white hover:from-purple-600 hover:to-indigo-600 transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                Go Home
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
} 