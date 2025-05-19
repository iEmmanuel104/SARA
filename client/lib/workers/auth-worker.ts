"use client";

// Background worker for handling auth-related tasks
let refreshInterval: NodeJS.Timeout | null = null;

export const authWorker = {
    startTokenRefresh: (callback: () => Promise<boolean>, interval: number = 14 * 60 * 1000) => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }

        refreshInterval = setInterval(async () => {
            try {
                await callback();
            } catch (error) {
                console.error('Token refresh failed:', error);
            }
        }, interval);
    },

    stopTokenRefresh: () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    },

    // Handle token refresh
    refreshToken: async () => {
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
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    },

    // Handle session cleanup
    cleanupSession: () => {
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
}; 