"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"

export function MainNav() {
    const pathname = usePathname()
    const { ready, authenticated, login, logout } = usePrivy()

    const routes = [
        {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname === "/dashboard",
        },
        {
            href: "/explore",
            label: "Explore",
            active: pathname === "/explore",
        },
        {
            href: "/saved",
            label: "Saved Properties",
            active: pathname === "/saved",
        },
    ]

    return (
        <header className="w-full border-b bg-white">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center">
                    <Logo size="default" href="/" />
                    <nav className="mx-6 hidden md:flex items-center space-x-4 lg:space-x-6">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-purple-600",
                                    route.active ? "text-purple-700" : "text-gray-700",
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    {!ready ? (
                        <div className="h-8 w-20 animate-pulse bg-gray-200 rounded" />
                    ) : authenticated ? (
                        <>
                            <Link href="/wallet-connect">
                                <Button variant="ghost" size="sm">
                                    My Wallet
                                </Button>
                            </Link>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={logout}
                            >
                                Log out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={login}
                            >
                                Connect Wallet
                            </Button>
                            <Link href="/signup">
                                <Button size="sm" className="text-white">Sign up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
