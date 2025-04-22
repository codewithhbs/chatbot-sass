import React from 'react';
import { SocketProvider } from './context/SocketContext';
import ChatInterface from './components/ChatInterface';
import ErrorState from './components/ErrorState';
import Background from './components/Background';

function App() {
  const metaCode = new URLSearchParams(window.location.search).get("metacode");

  if (!metaCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ErrorState
          message="Metacode not found"
          subMessage="Please ensure the correct Meta-Code is provided in the URL."
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SocketProvider metaCode={metaCode}>
      {/* <Background /> */}
        <ChatInterface />
      </SocketProvider>
    </div>
  );
}

export default App;
