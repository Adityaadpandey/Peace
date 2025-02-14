// components/Providers.tsx
'use client';

import { config } from '@/lib/wagmi-config'; // Make sure to create this
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
