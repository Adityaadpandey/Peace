import type { Doctor } from '@/types/chat';
import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export function useAvailableDoctors() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        let isSubscribed = true;
        const eventSource = new EventSource('/api/doctor/available');

        eventSource.onmessage = (event) => {
            if (!isSubscribed) return;

            try {
                const data = JSON.parse(event.data);
                setDoctors(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error parsing doctors:', err);
                setError('Failed to process available doctors');
                setIsLoading(false);
            }
        };

        eventSource.onerror = () => {
            if (!isSubscribed) return;

            setError('Connection error. Reconnecting...');
            setIsLoading(false);

            // The browser will automatically try to reconnect
            toast({
                title: 'Connection Error',
                description: 'Reconnecting to available doctors stream...',
                variant: 'destructive',
            });
        };

        return () => {
            isSubscribed = false;
            eventSource.close();
        };
    }, [toast]);

    const requestChat = async (doctorId: string) => {
        try {
            const response = await fetch('/api/chat/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ doctorId }),
            });

            if (!response.ok) {
                throw new Error('Failed to send chat request');
            }

            const data = await response.json();

            toast({
                title: 'Chat Request Sent',
                description: 'Waiting for doctor to accept your request...',
            });

            return data;
        } catch (error) {
            console.error('Error requesting chat:', error);
            toast({
                title: 'Error',
                description: 'Failed to send chat request',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const reconnect = () => {
        setError(null);
        setIsLoading(true);
        // The useEffect will automatically reconnect
    };

    return {
        doctors,
        isLoading,
        error,
        requestChat,
        reconnect
    };
}
