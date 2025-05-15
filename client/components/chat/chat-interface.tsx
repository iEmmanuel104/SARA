// client/components/chat/ChatInterface.tsx - Chat component using Vercel AI SDK

"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { PaperPlaneIcon, Loader2 } from "lucide-react";

export default function ChatInterface() {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);

    // Use the Vercel AI SDK for chat functionality
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat", // This endpoint will proxy to your backend
        onFinish: () => {
            setIsTyping(false);
        },
        onError: (error) => {
            console.error("Chat error:", error);
            setIsTyping(false);
        },
    });

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Start typing animation when loading
    useEffect(() => {
        setIsTyping(isLoading);
    }, [isLoading]);

    // Custom submit handler to prevent empty messages
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-muted-foreground p-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Welcome to SARA</h3>
                            <p>Your AI-powered Shortlet Apartment Realtor Agent. Ask me about finding the perfect place to stay!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <Avatar className="h-8 w-8">
                                    {message.role === "user" ? (
                                        <>
                                            <AvatarFallback>U</AvatarFallback>
                                            <AvatarImage src="/avatars/user.png" alt="User" />
                                        </>
                                    ) : (
                                        <>
                                            <AvatarFallback>AI</AvatarFallback>
                                            <AvatarImage src="/avatars/sara.png" alt="SARA" />
                                        </>
                                    )}
                                </Avatar>
                                <Card className={`p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    {message.content}
                                </Card>
                            </div>
                        </div>
                    ))
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>AI</AvatarFallback>
                                <AvatarImage src="/avatars/sara.png" alt="SARA" />
                            </Avatar>
                            <Card className="p-4 bg-muted flex items-center">
                                <div className="flex gap-1">
                                    <div className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce [animation-delay:0.4s]"></div>
                                    <div className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce [animation-delay:0.6s]"></div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t p-4">
                <form onSubmit={onSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask SARA about properties, destinations, or booking..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PaperPlaneIcon className="h-4 w-4" />}
                        <span className="ml-2 sr-only md:not-sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
