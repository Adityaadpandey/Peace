// app/chat/[sessionId]/page.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
// import { Avatar3D } from '../../_components/Avatar3D';
import { ChatInterface } from "../../_components/ChatInterface";

interface ChatSession {
  id: string;
  userId: string;
  doctorId: string;
  startedAt: Date;
  messageCount: number;
  user: {
    id: string;
    username: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

const ChatPage = () => {
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat/${sessionId}?init=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.statusText}`);
      }
      const data = await response.json();
      setSession(data);
    } catch (error) {
      console.error("Error fetching session:", error);
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
      router.push("/"); // Redirect to home on error
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast, router]);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, fetchSession]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#243949] via-[#517fa4] to-[#243949]">
        <div className="bg-black/20 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <div className="animate-pulse text-white">
            Loading chat session...
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no session
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="bg-black/20 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <div className="">Session not found</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#243949] via-[#517fa4] to-[#243949] p-3 sm:p-6">
        <div className="mx-auto flex h-screen max-w-7xl flex-col gap-4 lg:grid lg:grid-cols-[1fr,1.5fr] lg:items-center lg:gap-8">
          <div
            className={`relative ${isMobile ? "h-[40vh]" : "h-[600px]"} overflow-hidden rounded-3xl bg-black/20 p-4 sm:p-8 backdrop-blur-2xl border border-white/20 shadow-2xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
            {/* <Avatar3D
                            isSpeaking={isAvatarSpeaking}
                            onFinishSpeaking={() => setIsAvatarSpeaking(false)}
                        /> */}
          </div>
          <div
            className={`${isMobile ? "h-[50vh]" : "h-[600px]"} rounded-3xl bg-black/20 backdrop-blur-2xl border border-white/20 shadow-2xl`}
          >
            <ChatInterface
              sessionId={sessionId}
              senderId={user.id}
              senderRole={session.userId === user.id ? "USER" : "DOCTOR"}
              onAvatarSpeaking={setIsAvatarSpeaking}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
