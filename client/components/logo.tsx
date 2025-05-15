"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function DwellrLogo({ size = "default" }: { size?: "small" | "default" | "large" }) {
    const [isHovered, setIsHovered] = useState(false)

    const sizes = {
        small: {
            container: "h-8",
            iconContainer: "w-9 h-9",
            text: "text-lg",
            domain: "text-xs",
        },
        default: {
            container: "h-10",
            iconContainer: "w-11 h-11",
            text: "text-2xl",
            domain: "text-sm",
        },
        large: {
            container: "h-16",
            iconContainer: "w-16 h-16",
            text: "text-4xl",
            domain: "text-lg",
        },
    }

    return (
        <motion.div
            className={`flex items-center ${sizes[size].container}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }}
        >
            <div className={`relative mr-2 ${sizes[size].iconContainer}`}>
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg opacity-80"
                    animate={{
                        rotate: isHovered ? [0, 10, 0] : 0,
                        scale: isHovered ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.5 }}
                />
                <div className="relative w-full h-full flex items-center justify-center p-1.5">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-white">
                        {/* House outline */}
                        <path fill="currentColor" d="M12 2.5L1 12h3v8h16v-8h3L12 2.5z" opacity="0.85" />

                        {/* AI circuit patterns */}
                        <g fill="none" stroke="white" strokeWidth="0.5">
                            <circle cx="7" cy="14" r="1" />
                            <circle cx="17" cy="14" r="1" />

                            {/* Connection lines */}
                            <path d="M7 14L12 10L17 14" />
                            <path d="M7 14L4 17" />
                            <path d="M17 14L20 17" />

                            {/* Pulse animation */}
                            <motion.circle
                                cx="12"
                                cy="11"
                                r="4"
                                strokeOpacity="0.5"
                                animate={{
                                    r: isHovered ? [4, 5, 4] : 4,
                                    opacity: isHovered ? [0.5, 0.2, 0.5] : 0.5,
                                }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                            />
                        </g>

                        {/* Bot/Robot face in the center */}
                        <g>
                            {/* Bot head/face background */}
                            <circle cx="12" cy="11" r="3.2" fill="white" opacity="0.9" />

                            {/* Bot face features */}
                            <g fill="#6366F1">
                                {/* Eyes */}
                                <motion.circle
                                    cx="10.7"
                                    cy="10"
                                    r="0.7"
                                    animate={{
                                        opacity: isHovered ? [1, 0.7, 1] : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.circle
                                    cx="13.3"
                                    cy="10"
                                    r="0.7"
                                    animate={{
                                        opacity: isHovered ? [1, 0.7, 1] : 1,
                                    }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                />

                                {/* Mouth/speaker */}
                                <rect x="10.5" y="11.5" width="3" height="1.2" rx="0.6" />

                                {/* Antenna */}
                                <motion.path
                                    d="M12 7.8 L12 8.8"
                                    stroke="#6366F1"
                                    strokeWidth="0.8"
                                    animate={{
                                        y: isHovered ? [0, -0.3, 0] : 0,
                                    }}
                                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                                />
                                <circle cx="12" cy="7.5" r="0.5" />
                            </g>

                            {/* Small circuit details */}
                            <path d="M9 11.8 L8 12.5" stroke="white" strokeWidth="0.3" />
                            <path d="M15 11.8 L16 12.5" stroke="white" strokeWidth="0.3" />
                        </g>
                    </svg>
                </div>
            </div>
            <div className="flex flex-col">
                <div className="flex items-baseline">
                    <motion.span
                        className={`font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent ${sizes[size].text}`}
                        animate={{
                            y: isHovered ? [0, -2, 0] : 0,
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        dwellr
                    </motion.span>
                    <motion.span
                        className={`ml-1 text-gray-400 font-medium ${sizes[size].domain}`}
                        animate={{
                            opacity: isHovered ? [1, 0.7, 1] : 1,
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        .xyz
                    </motion.span>
                </div>
            </div>
        </motion.div>
    )
}
