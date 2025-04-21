import React from 'react';

interface ChatHeaderProps {
  title: string;
  chatEnded: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, chatEnded }) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 rounded-t-xl shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <div className="w-6 h-6 rounded-full bg-blue-400 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold">{title} Assistant</h1>
            <p className="text-xs text-blue-100 font-light">Always ready to help</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className={`w-2 h-2 rounded-full ${chatEnded ? 'bg-gray-400' : 'bg-green-400'}`}></div>
          <p className="text-xs text-blue-100">{chatEnded ? 'Closed' : 'Online'}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;