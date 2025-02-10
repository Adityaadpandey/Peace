import { useEffect, useState } from 'react';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderRole: 'USER' | 'DOCTOR';
    timestamp: Date;
}

export function useChat(sessionId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const eventSource = new EventSource(`/api/chat/${sessionId}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.status) {
                setStatus(data.status);
                if (data.status === 'ended') {
                    eventSource.close();
                }
            } else {
                setMessages(prev => [...prev, ...data]);
            }
        };

        eventSource.onerror = () => {
            setError('Connection error');
            eventSource.close();
        };

        return () => eventSource.close();
    }, [sessionId]);

    const sendMessage = async (content: string, senderId: string, senderRole: 'USER' | 'DOCTOR') => {
        try {
            const response = await fetch(`/api/chat/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, senderId, senderRole }),
            });

            if (!response.ok) throw new Error('Failed to send message');
        } catch (err) {
            setError('Failed to send message');
        }
    };

    return { messages, error, sendMessage };
}
