"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MessageSquare, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "ai/react"

export function ChatSearchBox() {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
        api: "/api/chat",
        initialMessages: [
            {
                id: "welcome",
                role: "assistant",
                content: "Hi! I'm SARA. How can I help you find the perfect place to stay?",
            },
        ],
        onFinish: () => {
            // If we have more than 3 messages (including the welcome), offer to continue in full chat
            if (messages.length >= 3 && !isMinimized) {
                setTimeout(() => {
                    setIsMinimized(true)
                }, 1000)
            }
        },
    })

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Focus the input when expanded
    useEffect(() => {
        if (isExpanded) {
            inputRef.current?.focus()
        }
    }, [isExpanded])

    const handleExpandClick = () => {
        setIsExpanded(true)
    }

    const handleCloseClick = () => {
        setIsExpanded(false)
        setIsMinimized(false)
    }

    const handleFullChatClick = () => {
        router.push("/chat")
    }

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (input.trim()) {
            handleSubmit(e)
        }
    }

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            <AnimatePresence>
                {!isExpanded ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <div
                            className="flex items-center w-full rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm cursor-text"
                            onClick={handleExpandClick}
                        >
                            <Search className="mr-2 h-5 w-5 text-gray-400" />
                            <span className="text-gray-500">Ask SARA about your ideal stay...</span>
                            <div className="ml-auto flex items-center">
                                <div className="rounded-full bg-purple-100 p-1">
                                    <MessageSquare className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden"
                    >
                        <div className="flex items-center justify-between border-b p-4">
                            <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src="/robot-face.png" />
                                    <AvatarFallback className="bg-purple-100 text-purple-600">AI</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">SARA</h3>
                                    <p className="text-xs text-gray-500">Your AI rental assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={handleFullChatClick}>
                                    Open Full Chat
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleCloseClick}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                                >
                                    {message.role === "assistant" && (
                                        <Avatar className="mr-2 h-8 w-8 flex-shrink-0">
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
                                        {message.content}
                                    </div>
                                    {message.role === "user" && (
                                        <Avatar className="ml-2 h-8 w-8 flex-shrink-0">
                                            <AvatarImage src="/diverse-person-avatars.png" />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-600">ME</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <Avatar className="mr-2 h-8 w-8 flex-shrink-0">
                                        <AvatarImage src="/robot-face.png" />
                                        <AvatarFallback className="bg-purple-100 text-purple-600">AI</AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-800">
                                        <div className="flex space-x-1">
                                            <motion.div
                                                className="h-2 w-2 rounded-full bg-purple-400"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                                            />
                                            <motion.div
                                                className="h-2 w-2 rounded-full bg-purple-400"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="h-2 w-2 rounded-full bg-purple-400"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <AnimatePresence>
                                {isMinimized && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex justify-center"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-purple-200 text-purple-600"
                                            onClick={handleFullChatClick}
                                        >
                                            Continue in full chat
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleFormSubmit} className="border-t p-4">
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <Input
                                        ref={inputRef}
                                        placeholder="Ask SARA about your ideal stay..."
                                        value={input}
                                        onChange={handleInputChange}
                                        className="pr-10"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
