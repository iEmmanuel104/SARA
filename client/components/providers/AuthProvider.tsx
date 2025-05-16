import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/auth-store';
import { privyConfig } from '@/src/lib/auth/privy-config';

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

function AuthSync({ children }: { children: React.ReactNode }) {
    const { user, ready, authenticated } = usePrivy();
    const router = useRouter();
    const { setUser, clearUser } = useAuthStore();

    useEffect(() => {
        const syncWithServer = async () => {
            if (!ready) return;

            if (authenticated && user) {
                try {
                    // Get the Privy token
                    const privyToken = await user.getAccessToken();
                    
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

                } catch (error) {
                    console.error('Error syncing with server:', error);
                    clearUser();
                }
            } else {
                clearUser();
            }
        };

        syncWithServer();
    }, [ready, authenticated, user, setUser, clearUser]);

    // Handle token refresh
    useEffect(() => {
        const refreshInterval = setInterval(async () => {
            if (authenticated && user) {
                try {
                    const response = await fetch('/api/v1/auth/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token: document.cookie
                                .split('; ')
                                .find(row => row.startsWith('refresh_token='))
                                ?.split('=')[1],
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        document.cookie = `access_token=${data.access_token}; path=/; secure; samesite=strict`;
                        document.cookie = `refresh_token=${data.refresh_token}; path=/; secure; samesite=strict`;
                    }
                } catch (error) {
                    console.error('Error refreshing token:', error);
                }
            }
        }, 14 * 60 * 1000); // Refresh every 14 minutes

        return () => clearInterval(refreshInterval);
    }, [authenticated, user]);

    return <>{children}</>;
} 