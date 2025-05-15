import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ChatButton } from "@/components/chat-button"

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
          {children}
          <ChatButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
