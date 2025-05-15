import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    preferredLanguage?: string;
    preferredCurrency?: string;
    linkedAccounts?: {
        type: string;
        address?: string;
        email?: string;
    }[];
    accessToken?: string;
    refreshToken?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: true }),
            clearUser: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user ? {
                    id: state.user.id,
                    email: state.user.email,
                    firstName: state.user.firstName,
                    lastName: state.user.lastName,
                    phoneNumber: state.user.phoneNumber,
                    preferredLanguage: state.user.preferredLanguage,
                    preferredCurrency: state.user.preferredCurrency,
                    linkedAccounts: state.user.linkedAccounts,
                } : null,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
); 