// client/app/providers.tsx
"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
