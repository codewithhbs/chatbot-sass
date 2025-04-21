import React from 'react';
import { SocketProvider } from './context/SocketContext';
import ChatInterface from './components/ChatInterface';

function App() {
  // Get metaCode from URL parameters or use default
  const metaCode = new URLSearchParams(window.location.search).get("metaCode") || 'chatbot-QUP9P-CCQS2';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SocketProvider metaCode={metaCode}>
        <ChatInterface />
      </SocketProvider>
    </div>
  );
}

export default App;