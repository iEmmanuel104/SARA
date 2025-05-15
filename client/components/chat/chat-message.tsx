"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { parseAIResponse } from "@/lib/ai-parser"
import { PropertyRecommendation } from "@/components/chat/property-recommendation"
import { BookingConfirmation } from "@/components/chat/booking-confirmations"

interface ChatMessageProps {
    message: {
        id: string
        role: "user" | "assistant"
        content: string
    }
}

export function ChatMessage({ message }: ChatMessageProps) {
    // Render message content based on type
    const renderMessageContent = (content: string) => {
        const parsedContent = parseAIResponse(content)

        if (parsedContent.type === "property" && parsedContent.property) {
            return (
                <>
                    <p>{parsedContent.text}</p>
                    <PropertyRecommendation property={parsedContent.property} />
                    <p>{parsedContent.remainingText}</p>
                </>
            )
        }

        if (parsedContent.type === "booking" && parsedContent.booking) {
            return (
                <>
                    <p>{parsedContent.text}</p>
                    <BookingConfirmation booking={parsedContent.booking} />
                    <p>{parsedContent.remainingText}</p>
                </>
            )
        }

        return content
    }

    return (
        <motion.div
            className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {message.role === "assistant" && (
                <Avatar className="mr-2 h-8 w-8">
                    <AvatarImage src="/robot-face.png" />
                    <AvatarFallback className="bg-purple-100 text-purple-600">AI</AvatarFallback>
                </Avatar>
            )}
            <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "assistant"
                        ? "bg-white border border-gray-200 text-gray-800"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    }`}
            >
                {renderMessageContent(message.content)}
            </div>
            {message.role === "user" && (
                <Avatar className="ml-2 h-8 w-8">
                    <AvatarImage src="/diverse-person-avatars.png" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">ME</AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    )
}
