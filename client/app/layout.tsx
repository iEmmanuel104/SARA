import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers/providers"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

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
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Providers>{children}</Providers>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  )
}
