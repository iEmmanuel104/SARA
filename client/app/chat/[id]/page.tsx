"use client"

import { useChat } from "ai/react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/ui/logo"
import { Send, ArrowLeft, ImageIcon, Paperclip, Mic, Clock, Plus, Search } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChatMessage } from "@/components/chat/chat-message"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample chat history data - in a real app, this would come from an API or state
const chatHistory = [
    {
        id: "chat1",
        title: "2BR apartment in NYC",
        preview: "Looking for a 2-bedroom apartment in New York...",
        date: "2 hours ago",
        messages: [
            {
                id: "1",
                role: "assistant",
                content: "Hi, I'm SARA, your AI rental assistant! How can I help you find the perfect shortlet today?",
            },
            {
                id: "2",
                role: "user",
                content: "I'm looking for a 2-bedroom apartment in New York for a family vacation next month.",
            },
            {
                id: "3",
                role: "assistant",
                content:
                    "Great! I'd be happy to help you find a 2-bedroom apartment in New York. Could you tell me more about your preferences? For example, which area of New York are you interested in, what's your budget, and are there any specific amenities you're looking for?",
            },
        ],
    },
    {
        id: "chat2",
        title: "Beach house in Miami",
        preview: "I need a beachfront property in Miami for next weekend...",
        date: "Yesterday",
        messages: [
            {
                id: "1",
                role: "assistant",
                content: "Hi, I'm SARA, your AI rental assistant! How can I help you find the perfect shortlet today?",
            },
            {
                id: "2",
                role: "user",
                content: "I need a beachfront property in Miami for next weekend.",
            },
            {
                id: "3",
                role: "assistant",
                content:
                    "I'd be happy to help you find a beachfront property in Miami for next weekend! Could you provide some more details about your stay? How many people will be staying, what's your budget, and are there any specific amenities you're looking for?",
            },
        ],
    },
    {
        id: "chat3",
        title: "Downtown loft",
        preview: "Searching for a modern loft in downtown area...",
        date: "3 days ago",
        messages: [
            {
                id: "1",
                role: "assistant",
                content: "Hi, I'm SARA, your AI rental assistant! How can I help you find the perfect shortlet today?",
            },
            {
                id: "2",
                role: "user",
                content: "Searching for a modern loft in downtown area.",
            },
            {
                id: "3",
                role: "assistant",
                content:
                    "I'd be happy to help you find a modern loft in a downtown area! To better assist you, could you specify which city you're interested in? Also, it would be helpful to know your budget, the dates of your stay, and how many people will be staying.",
            },
        ],
    },
]

export default function ChatDetail({ params }: { params: { id: string } }) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [showSidebar, setShowSidebar] = useState(true)

    // Find the chat by ID
    const currentChat = chatHistory.find((chat) => chat.id === params.id) || chatHistory[0]

    // Use the useChat hook from Vercel AI SDK [^2]
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: "/api/chat",
        id: params.id,
    })

    // Set initial messages from chat history
    useEffect(() => {
        if (currentChat && currentChat.messages) {
            setMessages(currentChat.messages)
        }
    }, [currentChat, setMessages])

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="border-b bg-white">
                <div className="container flex h-16 items-center px-4">
                    <Link href="/chat" className="mr-6">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Logo size="small" />
                    <div className="ml-4 flex-1">
                        <h1 className="text-lg font-medium">{currentChat.title}</h1>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="hidden md:flex" onClick={() => setShowSidebar(!showSidebar)}>
                            {showSidebar ? "Hide History" : "Show History"}
                        </Button>
                        <Link href="/chat/history">
                            <Button variant="ghost" size="sm" className="md:hidden">
                                History
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex flex-1">
                {/* Chat History Sidebar - Hidden on mobile */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 300, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hidden md:block border-r bg-white w-[300px] overflow-hidden"
                        >
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold">Chat History</h2>
                                        <Link href="/chat">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input type="search" placeholder="Search chats..." className="pl-9" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <div className="space-y-1 p-2">
                                        {chatHistory.map((chat) => (
                                            <Link key={chat.id} href={`/chat/${chat.id}`} className="block">
                                                <Button
                                                    variant="ghost"
                                                    className={`w-full justify-start font-normal ${chat.id === params.id
                                                        ? "bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                                                        : ""
                                                        }`}
                                                >
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    {chat.title}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col">
                    <div className="container flex max-w-4xl flex-1 flex-col px-4 py-4">
                        <div className="flex-1 overflow-auto rounded-lg border bg-white p-4 shadow-sm">
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {messages.map((message) => (
                                        <ChatMessage key={message.id} message={message} />
                                    ))}
                                </AnimatePresence>

                                {isLoading && (
                                    <motion.div
                                        className="flex justify-start"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Avatar className="mr-2 h-8 w-8">
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
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4">
                            <div className="flex items-center space-x-2">
                                <Button type="button" size="icon" variant="ghost" className="flex-shrink-0">
                                    <Paperclip className="h-5 w-5 text-gray-500" />
                                </Button>
                                <Button type="button" size="icon" variant="ghost" className="flex-shrink-0">
                                    <ImageIcon className="h-5 w-5 text-gray-500" />
                                </Button>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Describe your ideal rental property..."
                                        value={input}
                                        onChange={handleInputChange}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-1 top-1/2 -translate-y-1/2"
                                    >
                                        <Mic className="h-5 w-5 text-gray-500" />
                                    </Button>
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

                        <div className="mt-4 text-center text-xs text-gray-500">
                            SARA is an AI assistant and may produce inaccurate information about properties or availability.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
