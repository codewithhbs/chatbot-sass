import React from "react";
import { MessageSquare } from "lucide-react";

interface ChatButtonProps {
  isChatOpen: boolean;
  onClick: () => void;
  websiteInfo?: {
    title?: string;
  };
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  isChatOpen, 
  onClick,
  websiteInfo 
}) => {
  return (
    <button
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
      className={`fixed bottom-6 right-6 z-50 group flex items-center justify-center transition-all 
                 duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
      onClick={onClick}
    >
      {/* Shadow elements for depth effect */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 blur-md opacity-70 
                     group-hover:opacity-80 transition-opacity"></span>
      
      {/* Main button */}
      <span className={`relative flex items-center justify-center w-16 h-16 rounded-full 
                      bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg 
                      group-hover:shadow-xl transition-all duration-300 
                      ${isChatOpen ? 'rotate-90' : 'animate-subtle-pulse'}`}>
        <MessageSquare className="w-7 h-7" />
        
        {/* Notification dot */}
        {!isChatOpen && (
          <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </span>
      
      {/* Label that appears on hover */}
      <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1.5 
                     rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {isChatOpen ? "Close chat" : `Chat with ${websiteInfo?.title || "Assistant"}`}
      </span>
    </button>
  );
};

export default ChatButton;