import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse flex flex-col items-center text-blue-400">
        <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce mb-2"></div>
        <p className="text-sm">Connecting...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;