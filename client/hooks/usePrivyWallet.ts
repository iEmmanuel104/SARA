import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

interface WalletCredentials {
    walletId: string;
    authorizationPrivateKey: string;
    authorizationKeyId: string;
}

export const usePrivyWallet = () => {
    const { user, ready, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const [credentials, setCredentials] = useState<WalletCredentials | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const setupWallet = async () => {
            if (!ready || !authenticated || !user) {
                setIsLoading(false);
                return;
            }

            try {
                // Get the embedded wallet
                const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

                if (!embeddedWallet) {
                    throw new Error('No embedded wallet found');
                }

                // Get wallet details
                const walletDetails = await embeddedWallet.getWalletDetails();

                if (!walletDetails) {
                    throw new Error('Failed to get wallet details');
                }

                // Set credentials
                setCredentials({
                    walletId: walletDetails.walletId,
                    authorizationPrivateKey: walletDetails.authorizationPrivateKey,
                    authorizationKeyId: walletDetails.authorizationKeyId
                });

                // Store credentials in localStorage for server use
                localStorage.setItem('walletCredentials', JSON.stringify({
                    walletId: walletDetails.walletId,
                    authorizationPrivateKey: walletDetails.authorizationPrivateKey,
                    authorizationKeyId: walletDetails.authorizationKeyId
                }));

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to setup wallet');
                console.error('Wallet setup error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        setupWallet();
    }, [ready, authenticated, user, wallets]);

    return {
        credentials,
        isLoading,
        error,
        isAuthenticated: authenticated,
        user
    };
}; 