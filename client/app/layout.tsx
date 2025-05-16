import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ChatButton } from "@/components/chat-button"
import NextTopLoader from "nextjs-toploader"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Dwellr.xyz - Find Your Perfect Shortlet",
  description: "AI-powered shortlet apartment search and booking platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <NextTopLoader
            color="#9333ea"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #9333ea,0 0 5px #9333ea"
          />
          {children}
          <ChatButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
