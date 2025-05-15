import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
    const { login, logout: privyLogout, user, ready, authenticated } = usePrivy();
    const { setUser, clearUser, user: storeUser, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const handleLogin = useCallback(async () => {
        try {
            await login();
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }, [login]);

    const handleLogout = useCallback(async () => {
        try {
            // Clear server-side session
            await fetch('/api/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Clear client-side state
            clearUser();
            await privyLogout();

            // Clear cookies
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

            // Redirect to home page
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }, [privyLogout, clearUser, router]);

    const isProtectedRoute = useCallback((path: string) => {
        const protectedPaths = ['/dashboard', '/profile', '/settings'];
        return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
    }, []);

    const checkAuth = useCallback(() => {
        if (!ready) return false;

        if (!authenticated && isProtectedRoute(router.pathname)) {
            router.push('/');
            return false;
        }

        return authenticated;
    }, [ready, authenticated, router, isProtectedRoute]);

    return {
        user: storeUser,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        checkAuth,
        isLoading: !ready,
    };
} 