// components/ChatInterface.tsx
import { useChat } from '@/hooks/useChat';
import { useEffect, useRef } from 'react';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';

interface ChatInterfaceProps {
  sessionId: string;
  senderId: string;
  senderRole: 'USER' | 'DOCTOR';
  onAvatarSpeaking?: (isSpeaking: boolean) => void;
}

export const ChatInterface = ({
  sessionId,
  senderId,
  senderRole,
  onAvatarSpeaking
}: ChatInterfaceProps) => {
  const { messages, error, sendMessage } = useChat(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (onAvatarSpeaking) {
      onAvatarSpeaking(true);
    }

    await sendMessage(text, senderId, senderRole);

    setTimeout(() => {
      if (onAvatarSpeaking) {
        onAvatarSpeaking(false);
      }
    }, 1000);
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-3 sm:p-6 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.content}
            isUser={message.senderId === senderId}
            timestamp={new Date(message.timestamp).toLocaleTimeString()}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-white/10 p-3 sm:p-6">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};
