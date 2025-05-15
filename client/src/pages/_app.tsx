import type { AppProps } from 'next/app';
import { Providers } from '@/components/providers/providers';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Providers>
            <Component {...pageProps} />
        </Providers>
    );
} 