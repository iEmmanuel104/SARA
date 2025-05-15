import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { MainNav } from "@/components/main-nav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <AppSidebar />
                <SidebarInset className="flex flex-col">
                    <div className="flex h-16 items-center border-b px-4">
                        <SidebarTrigger />
                        <MainNav />
                    </div>
                    <main className="flex-1 overflow-auto">{children}</main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
