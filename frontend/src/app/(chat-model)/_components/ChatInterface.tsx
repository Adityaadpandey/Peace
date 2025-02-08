
import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatInterfaceProps {
  onAvatarSpeaking?: (isSpeaking: boolean) => void;
}

export const ChatInterface = ({ onAvatarSpeaking }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I assist you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      if (onAvatarSpeaking) {
        onAvatarSpeaking(true);
      }

      const response: Message = {
        id: messages.length + 2,
        text: "I received your message and I'm processing it...",
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, response]);

      setTimeout(() => {
        if (onAvatarSpeaking) {
          onAvatarSpeaking(false);
        }
      }, 3000);
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-3 sm:p-6 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
      </div>
      <div className="border-t border-white/10 p-3 sm:p-6">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};
