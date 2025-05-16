'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WalletConnectPage() {
    const { ready, authenticated, login, user } = usePrivy();
    const router = useRouter();

    useEffect(() => {
        if (ready && authenticated) {
            // Redirect to dashboard or home page after successful authentication
            router.push('/dashboard');
        }
    }, [ready, authenticated, router]);

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SARA</h2>
                    <p className="text-gray-600 mb-8">Connect your wallet to get started</p>
                    
                    {!authenticated && (
                        <button
                            onClick={login}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}