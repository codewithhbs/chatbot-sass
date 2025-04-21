import React from 'react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} 
                    ${index === messages.length - 1 ? 'animate-fadeIn' : ''}`}
        >
          {msg.sender === 'ai' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
          )}

          <div
            className={`px-4 py-3 rounded-2xl max-w-[85%] md:max-w-[70%] text-sm md:text-base 
                      ${msg.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow-blue-400/20'
                : 'bg-white dark:bg-gray-800 dark:text-gray-100 text-gray-800 rounded-bl-none shadow-gray-200/50 dark:shadow-none'
              } shadow-md`}
          >
            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>

          {msg.sender === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default MessageList;