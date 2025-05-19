import { PrivyClientConfig } from '@privy-io/react-auth';
import { base, baseGoerli, mainnet, sepolia, polygon, polygonMumbai } from 'viem/chains';

export const privyConfig: PrivyClientConfig = {
    appearance: {
        walletList: ['coinbase_wallet', 'metamask', 'rainbow', 'wallet_connect'],
        theme: 'light',
        accentColor: '#7C3AED', // Purple to match our theme
        logo: '/logo.png',
        showWalletLoginFirst: true,
    },
    loginMethods: [
        'wallet',
        'email',
        'google',
        // 'discord',
        // 'github',
    ],
    embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        // noPromptOnSignature: false,
    },
    externalWallets: {
        coinbaseWallet: {
            connectionOptions: 'smartWalletOnly',
        },
    },
    defaultChain: base,
    supportedChains: [base, mainnet, sepolia, baseGoerli, polygon, polygonMumbai],
    // Add custom styling for the modal
    // modal: {
    //     title: 'Welcome to SARA',
    //     subtitle: 'Connect your wallet or sign in to get started',
    //     primaryButtonText: 'Continue',
    //     secondaryButtonText: 'Learn More',
    // },
}; 