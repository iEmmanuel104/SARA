"use client";

import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { privyConfig } from '@/lib/auth/privy-config';
import { authWorker } from '@/lib/workers/auth-worker';

// Separate client component for auth sync
const AuthSync = ({ children }: { children: React.ReactNode }) => {
    const { user, ready, authenticated, getAccessToken } = usePrivy();
    const router = useRouter();
    const { setUser, clearUser } = useAuthStore();

    useEffect(() => {
        const syncWithServer = async () => {
            if (!ready) return;

            if (authenticated && user) {
                try {
                    // Get the Privy token
                    const privyToken = await getAccessToken();
                    
                    // Send token to your backend
                    const response = await fetch('/api/v1/auth/login', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${privyToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to authenticate with server');
                    }

                    const data = await response.json();
                    
                    // Store the JWT token and user data
                    setUser({
                        ...data.user,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                    });

                    // Store tokens in secure HTTP-only cookies
                    document.cookie = `access_token=${data.access_token}; path=/; secure; samesite=strict`;
                    document.cookie = `refresh_token=${data.refresh_token}; path=/; secure; samesite=strict`;

                    // Start token refresh worker
                    authWorker.startTokenRefresh(authWorker.refreshToken);

                } catch (error) {
                    console.error('Error syncing with server:', error);
                    clearUser();
                    authWorker.cleanupSession();
                }
            } else {
                clearUser();
                authWorker.cleanupSession();
            }
        };

        syncWithServer();

        // Cleanup on unmount
        return () => {
            authWorker.stopTokenRefresh();
        };
    }, [ready, authenticated, user, setUser, clearUser, getAccessToken]);

    return <>{children}</>;
};

// Main provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={privyConfig}
        >
            <AuthSync>{children}</AuthSync>
        </PrivyProvider>
    );
} 