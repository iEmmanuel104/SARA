"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Search,
    Heart,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    User,
    Map,
    Compass,
    TrendingUp,
    Hotel,
    Building,
    Clock,
    Plus,
} from "lucide-react"

import { Logo } from "@/components/ui/logo"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"

// Sample chat history data - in a real app, this would come from an API or state
const chatHistory = [
    {
        id: "chat1",
        title: "2BR apartment in NYC",
        preview: "Looking for a 2-bedroom apartment in New York...",
        date: "2 hours ago",
    },
    {
        id: "chat2",
        title: "Beach house in Miami",
        preview: "I need a beachfront property in Miami for next weekend...",
        date: "Yesterday",
    },
    {
        id: "chat3",
        title: "Downtown loft",
        preview: "Searching for a modern loft in downtown area...",
        date: "3 days ago",
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarHeader className="border-b pb-2">
                <div className="flex items-center px-2 py-2">
                    <Logo size="small" href="/" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                                    <Link href="/dashboard">
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/explore"}>
                                    <Link href="/explore">
                                        <Search className="mr-2 h-4 w-4" />
                                        <span>Explore</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/saved"}>
                                    <Link href="/saved">
                                        <Heart className="mr-2 h-4 w-4" />
                                        <span>Saved</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/bookings"}>
                                    <Link href="/bookings">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        <span>Bookings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/chat" || pathname.startsWith("/chat/")}>
                                    <Link href="/chat">
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        <span>Chat with SARA</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Chat History Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chatHistory.map((chat) => (
                                <SidebarMenuItem key={chat.id}>
                                    <SidebarMenuButton asChild>
                                        <Link href={`/chat/${chat.id}`}>
                                            <Clock className="mr-2 h-4 w-4" />
                                            <span>{chat.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/chat">
                                        <Plus className="mr-2 h-4 w-4" />
                                        <span>New Chat</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Discover</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/map"}>
                                    <Link href="/map">
                                        <Map className="mr-2 h-4 w-4" />
                                        <span>Map View</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/trending"}>
                                    <Link href="/trending">
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        <span>Trending</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/nearby"}>
                                    <Link href="/nearby">
                                        <Compass className="mr-2 h-4 w-4" />
                                        <span>Nearby</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Property Types</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/explore?type=apartment">
                                        <Building className="mr-2 h-4 w-4" />
                                        <span>Apartments</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/explore?type=house">
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Houses</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/explore?type=hotel">
                                        <Hotel className="mr-2 h-4 w-4" />
                                        <span>Hotels</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t pt-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/profile">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/signout">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
