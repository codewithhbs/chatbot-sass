import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-blue-100 dark:border-blue-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-b-xl">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
            placeholder={disabled ? "Chat ended" : "Type your message..."}
            className={`w-full bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-2xl py-3 px-4 pr-12 text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 min-h-[52px] max-h-32 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ overflowY: 'auto' }}
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={message.trim() === '' || disabled}
            className={`absolute right-3 bottom-[10px] rounded-full p-2 
                      ${message.trim() === '' || disabled
                ? 'bg-blue-300 text-blue-100 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700'
              } transition-all duration-200 transform hover:scale-105 active:scale-95`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;