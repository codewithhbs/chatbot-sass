import React from "react";
import { X } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  chatEnded: boolean;
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, chatEnded, onClose }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-5 flex items-center justify-between shadow-md relative z-10">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-xs text-blue-100">
            {chatEnded ? "Conversation ended" : "Online"}
          </p>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm
                  hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 
                  focus:ring-white/50 text-white"
        aria-label="Close chat"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default ChatHeader;