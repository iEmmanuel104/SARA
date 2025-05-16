"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function ChatButton() {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Link href="/chat">
                <Button
                    size="lg"
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 p-0 shadow-lg"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <MessageSquare className="h-6 w-6 text-white" />
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: -70 }}
                                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                className="absolute right-full mr-2 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-purple-600 shadow-md"
                            >
                                Chat with AI
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </Link>
        </div>
    )
}
