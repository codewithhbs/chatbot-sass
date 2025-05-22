import React from 'react';
import { SocketProvider } from './context/SocketContext';
import ChatInterface from './components/ChatInterface';
import ErrorState from './components/ErrorState';
import Background from './components/Background';
import ChatInterfacetwo from './components/ChatInterfacetwo';

function App() {
  const metaCode = new URLSearchParams(window.location.search).get("metacode");
  const type = new URLSearchParams(window.location.search).get("type");

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
    <div className="h-auto flex items-center justify-center">
      <SocketProvider type={type} metaCode={metaCode}>
        {/* <Background /> */}
        {type === "custom" ? (
          <ChatInterfacetwo />
        ) : (
          <ChatInterface />
        )}
      </SocketProvider>
    </div>
  );
}

export default App;
