import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
    appearance: {
        theme: 'light',
        accentColor: '#000000',
        logo: '/logo.png', // Add your logo path
    },
    loginMethods: [
        'email',
        'wallet',
        'google',
        'discord',
        'github',
    ],
    embeddedWallets: {
        createOnLogin: 'all-users',
        noPromptOnSignature: false,
    },
    defaultChain: 84532, // Base Sepolia
    supportedChains: [
        {
            chainId: 84532,
            name: 'Base Sepolia',
            rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
            blockExplorer: 'https://sepolia.basescan.org',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
        },
    ],
}; 