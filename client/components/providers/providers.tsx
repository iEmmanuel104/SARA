"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { ChatButton } from "@/components/chat-button";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/components/providers/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AuthProvider>
                <NextTopLoader
                    color="#9333ea"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                />
                {children}
                <ChatButton />
            </AuthProvider>
        </ThemeProvider>
    );
} 