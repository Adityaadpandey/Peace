
import { useState } from "react";
import { Avatar3D } from "@/components/Avatar3D";
import { ChatInterface } from "@/components/ChatInterface";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#243949] via-[#517fa4] to-[#243949] p-3 sm:p-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 lg:grid lg:grid-cols-[1fr,1.5fr] lg:items-center lg:gap-8">
        <div className={`relative ${isMobile ? 'h-[40vh]' : 'h-[600px]'} overflow-hidden rounded-3xl bg-black/20 p-4 sm:p-8 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20 hover:border-white/30`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
          <Avatar3D 
            isSpeaking={isAvatarSpeaking}
            onFinishSpeaking={() => setIsAvatarSpeaking(false)}
          />
        </div>
        <div className={`${isMobile ? 'h-[50vh]' : 'h-[600px]'} rounded-3xl bg-black/20 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20`}>
          <ChatInterface onAvatarSpeaking={setIsAvatarSpeaking} />
        </div>
      </div>
    </div>
  );
};

export default Index;
