// app/chat/[sessionId]/page.tsx
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar3D } from '../../_components/Avatar3D';
import { ChatInterface } from '../../_components/ChatInterface';

interface ChatSession {
    id: string;
    userId: string;
    doctorId: string;
    startedAt: Date;
    messageCount: number;
}

const ChatPage = () => {
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [session, setSession] = useState<ChatSession | null>(null);
    const isMobile = useIsMobile();
    const { user } = useUser();
    const params = useParams();
    const sessionId = params.sessionId as string;

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`/api/chat/${sessionId}`);
                const data = await response.json();
                setSession(data);
            } catch (error) {
                console.error('Error fetching session:', error);
            }
        };

        if (sessionId) {
            fetchSession();
        }
    }, [sessionId]);

    if (!session || !user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#243949] via-[#517fa4] to-[#243949] p-3 sm:p-6">
                <div className="mx-auto flex h-screen max-w-7xl flex-col gap-4 lg:grid lg:grid-cols-[1fr,1.5fr] lg:items-center lg:gap-8">
                    <div className={`relative ${isMobile ? 'h-[40vh]' : 'h-[600px]'} overflow-hidden rounded-3xl bg-black/20 p-4 sm:p-8 backdrop-blur-2xl border border-white/20 shadow-2xl`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
                        <Avatar3D
                            isSpeaking={isAvatarSpeaking}
                            onFinishSpeaking={() => setIsAvatarSpeaking(false)}
                        />
                    </div>
                    <div className={`${isMobile ? 'h-[50vh]' : 'h-[600px]'} rounded-3xl bg-black/20 backdrop-blur-2xl border border-white/20 shadow-2xl`}>
                        <ChatInterface
                            sessionId={sessionId}
                            senderId={user.id}
                            senderRole={session.userId === user.id ? 'USER' : 'DOCTOR'}
                            onAvatarSpeaking={setIsAvatarSpeaking}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
