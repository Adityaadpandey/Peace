// lib/wagmi-config.ts
import { defineChain } from 'viem';
import { createConfig, http } from 'wagmi';

export const BitTorrent = defineChain({
    id: 1029,
    name: "BitTorrent Chain Testnet",
    network: "BitTorrent Chain Testnet",
    nativeCurrency: {
        decimals: 18,
        name: 'BitTorrent Chain Testnet',
        symbol: 'BTTC',
    },
    rpcUrls: {
        default: {
            http: ['https://pre-rpc.bt.io/']
        }
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://testscan.bt.io/'
        }
    }
});

export const config = createConfig({
    chains: [BitTorrent],
    transports: {
        [BitTorrent.id]: http()
    }
});
