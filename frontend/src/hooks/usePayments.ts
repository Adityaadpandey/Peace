// hooks/usePayments.ts
'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

// Replace with your contract address
const CONTRACT_ADDRESS = '0x2a51b00247C442FC7C9D6211dFEdC408D56f6b3B';

const CONTRACT_ABI = [
    "function getPrice(uint256 _itemId) external view returns (uint256)",
    "function makePayment(uint256 _itemId) external payable",
    "function items(uint256) public view returns (uint256 price, bool isActive)"
] as const;

export function usePayments() {
    const { isSignedIn } = useUser();
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const [isLoading, setIsLoading] = useState(false);

    const getPrice = useCallback(async (itemId: number) => {
        if (!address) return null;

        try {
            const price = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getPrice',
                args: [BigInt(itemId)]
            });

            return price;
        } catch (error) {
            console.error('Error getting price:', error);
            return null;
        }
    }, [address, publicClient]);

    const makePayment = useCallback(async (itemId: number, price: bigint) => {
        if (!isSignedIn) {
            toast.error('Please sign in to make a purchase');
            return null;
        }

        if (!address || !walletClient) {
            toast.error('Please connect your wallet');
            return null;
        }

        setIsLoading(true);

        try {
            const hash = await walletClient.writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'makePayment',
                args: [BigInt(itemId)],
                value: price
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            toast.success('Payment successful!');
            return receipt;
        } catch (error: any) {
            toast.error(error?.message || 'Payment failed');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [isSignedIn, address, walletClient, publicClient]);

    return {
        getPrice,
        makePayment,
        isLoading
    };
}
