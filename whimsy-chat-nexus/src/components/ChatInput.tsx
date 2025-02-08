
import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white/5 p-2 sm:p-3 backdrop-blur-lg border border-white/20 transition-all duration-300 focus-within:bg-white/10 hover:border-white/30"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 bg-transparent px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white outline-none placeholder:text-white/50 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-indigo-500/90 p-2 sm:p-2.5 text-white transition-all duration-300 hover:scale-105 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        disabled={!message.trim()}
      >
        <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </form>
  );
};
