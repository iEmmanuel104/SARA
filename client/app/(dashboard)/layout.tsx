import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicIsland } from "@/components/dynamic-island"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex flex-row bg-gray-50">
                <AppSidebar />
                <SidebarInset className="flex-1 flex flex-col relative">
                    {/* <DynamicIsland isLoggedIn={true} /> */}
                    <main className="flex-1">{children}</main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
