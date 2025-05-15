"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Search, Trash2, ArrowLeft, Plus } from "lucide-react"
import { Logo } from "@/components/ui/logo"

// Sample chat history data - in a real app, this would come from an API or state
const chatHistory = [
    {
        id: "chat1",
        title: "2BR apartment in NYC",
        preview:
            "Looking for a 2-bedroom apartment in New York for a family vacation next month. Need to be close to Central Park and have good public transportation options.",
        date: "2 hours ago",
        messages: 12,
    },
    {
        id: "chat2",
        title: "Beach house in Miami",
        preview:
            "I need a beachfront property in Miami for next weekend. Budget is around $300 per night, and I need space for 4 adults.",
        date: "Yesterday",
        messages: 8,
    },
    {
        id: "chat3",
        title: "Downtown loft",
        preview:
            "Searching for a modern loft in downtown area with parking and gym access. Planning to stay for a week in June.",
        date: "3 days ago",
        messages: 15,
    },
    {
        id: "chat4",
        title: "Cabin in the mountains",
        preview:
            "Looking for a cozy cabin in the mountains, preferably with a hot tub and fireplace. Need it for a weekend getaway.",
        date: "1 week ago",
        messages: 6,
    },
    {
        id: "chat5",
        title: "Studio in San Francisco",
        preview: "Need a studio apartment in San Francisco for a business trip. Should be close to the financial district.",
        date: "2 weeks ago",
        messages: 10,
    },
]

export default function ChatHistory() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredChats = chatHistory.filter(
        (chat) =>
            chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.preview.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="border-b bg-white">
                <div className="container flex h-16 items-center px-4">
                    <Link href="/dashboard" className="mr-6">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Logo size="small" />
                    <div className="ml-auto"></div>
                </div>
            </header>

            <main className="flex-1">
                <div className="container max-w-4xl px-4 py-8">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Chat History</h1>
                            <p className="text-gray-500">Your conversations with SARA</p>
                        </div>
                        <Link href="/chat">
                            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                                <Plus className="mr-2 h-4 w-4" />
                                New Chat
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search conversations..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mt-6 space-y-4"
                    >
                        {filteredChats.map((chat) => (
                            <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <Link href={`/chat/${chat.id}`}>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                                            <MessageSquare className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{chat.title}</h3>
                                                            <p className="text-xs text-gray-500">
                                                                {chat.date} • {chat.messages} messages
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{chat.preview}</p>
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {filteredChats.length === 0 && (
                            <div className="mt-12 flex flex-col items-center justify-center py-12 text-center">
                                <MessageSquare className="h-16 w-16 text-gray-300" />
                                <h3 className="mt-4 text-xl font-medium">No conversations found</h3>
                                <p className="mt-2 text-gray-500 max-w-md">
                                    {searchTerm
                                        ? `No conversations matching "${searchTerm}"`
                                        : "You haven't had any conversations with SARA yet"}
                                </p>
                                <Link href="/chat">
                                    <Button className="mt-6">Start a New Chat</Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
