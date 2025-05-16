import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { usePrivy } from '@privy-io/react-auth';

export const WalletSetup = () => {
    const { login, ready } = usePrivy();
    const { credentials, isLoading, error, isAuthenticated } = usePrivyWallet();

    if (!ready) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
                <button
                    onClick={login}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Login with Privy
                </button>
            </div>
        );
    }

    if (isLoading) {
        return <div>Setting up your wallet...</div>;
    }

    if (error) {
        return (
            <div className="text-red-500">
                <h3>Error setting up wallet:</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (credentials) {
        return (
            <div className="text-green-500">
                <h3>Wallet Setup Complete!</h3>
                <p>Your wallet has been configured successfully.</p>
            </div>
        );
    }

    return null;
}; 