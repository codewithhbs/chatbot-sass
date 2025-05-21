import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of our context
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  websiteInfo: WebsiteInfo | null;
}

interface WebsiteInfo {
  title: string;
  logo: string | null;
  description: string | null;
  timings: string | null;
}

// Create the context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  loading: true,
  error: null,
  websiteInfo: null,
});

// Custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
  metaCode: string;
  type: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, metaCode, type }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io("https://api.chatbot.adsdigitalmedia.com", {
      query: { metaCode, type }
    });

    setSocket(socketInstance);

    // Socket event handlers
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setLoading(false);
      socketInstance.emit('start_chat'); // Request website info on connection
    });

    socketInstance.on('connect_error', () => {
      setError('Failed to connect to the server. Please try again later.');
      setLoading(false);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setError('Connection lost. Please refresh the page.');
    });

    socketInstance.on('website_info', (info: WebsiteInfo) => {
      console.log('Website Info:', info);
      setWebsiteInfo(info);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [metaCode ,type]);

  const value = {
    socket,
    isConnected,
    loading,
    error,
    websiteInfo
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;