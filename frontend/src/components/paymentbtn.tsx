'use client';

import { Button } from '@/components/ui/button';
import { usePayments } from '@/hooks/usePayments';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

interface PaymentButtonProps {
    itemId: number;
    itemName: string;
    className?: string;
}

export function PaymentButton({ itemId, itemName, className = '' }: PaymentButtonProps) {
    const { address } = useAccount();
    const { getPrice, makePayment, isLoading } = usePayments();
    const [price, setPrice] = useState<bigint | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            const itemPrice = await getPrice(itemId);
            if (itemPrice) setPrice(itemPrice);
        };

        if (address) {
            fetchPrice();
        }
    }, [address, itemId, getPrice]);

    const handlePayment = async () => {
        if (!price) return;
        await makePayment(itemId, price);
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={isLoading || !price || !address}
            className={className}
        >
            {isLoading
                ? 'Processing...'
                : !address
                    ? 'Connect Wallet'
                    : price
                        ? `Buy ${itemName} for ${formatEther(price)} BTTC`
                        : 'Loading...'}
        </Button>
    );
}
