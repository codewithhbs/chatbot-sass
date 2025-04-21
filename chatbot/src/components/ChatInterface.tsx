import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ServiceSelection from './ServiceSelection';
import DateSelection from './DateSelection';
import ContactDetails from './ContactDetails';
import ChatHeader from './ChatHeader';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import { Message, Category, Service, ContactDetailsType } from '../types';

const ChatInterface: React.FC = () => {
  const { socket, isConnected, loading, error, websiteInfo } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetailsType | null>(null);
  const [chatEnded, setChatEnded] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showContactDetails]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleChunk = (data: { chunk?: string }) => {
      setIsTyping(true);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.sender === 'ai') {
          return [...prev.slice(0, -1), { ...last, text: last.text + (data?.chunk || '') }];
        } else {
          return [...prev, { sender: 'ai', text: data?.chunk || '' }];
        }
      });
    };

    const handleShowCategories = (categoryData: Category[]) => {
      setCategories(categoryData);
    };

    const handleShowServices = (serviceData: string[]) => {
      setServices(serviceData.map(name => ({ name })));
    };

    const handleComplete = () => {
      setIsTyping(false);
    };

    const handleShowDatePicker = () => {
      setShowDatePicker(true);
    };

    const handleContactDetails = (details: ContactDetailsType) => {
      setContactDetails(details);
      setShowContactDetails(true);
    };

    const handleBookingComplete = () => {
      setBookingComplete(true);
    };

    socket.on('ai_reply', handleChunk);
    socket.on('ai_complete', handleComplete);
    socket.on('_show_categories', handleShowCategories);
    socket.on('_show_services', handleShowServices);
    socket.on('_show_date_picker', handleShowDatePicker);
    socket.on('blueace_contact_details', handleContactDetails);
    socket.on('booking_done', handleBookingComplete);

    return () => {
      socket.off('ai_reply', handleChunk);
      socket.off('ai_complete', handleComplete);
      socket.off('_show_categories', handleShowCategories);
      socket.off('_show_services', handleShowServices);
      socket.off('_show_date_picker', handleShowDatePicker);
      socket.off('blueace_contact_details', handleContactDetails);
      socket.off('booking_done', handleBookingComplete);
    };
  }, [socket]);

  const handleCategorySelect = (category: string) => {
    if (!socket) return;
    
    socket.emit('user_category_selected', category);
    setShowServiceSelection(true);
  };

  const handleServiceSelect = (service: string) => {
    if (!socket) return;
    
    socket.emit('user_service_selected', service);
    setServices([]);
    setCategories([]);
    setShowServiceSelection(false);
  };

  const handleSendMessage = (text: string) => {
    if (!socket || !text.trim() || chatEnded) return;

    socket.emit('user_message', { message: text });
    setMessages(prev => [...prev, { sender: 'user', text: text }]);
    setIsTyping(true);
  };

  const handleDateSelect = (date: Date) => {
    if (!socket) return;

    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    socket.emit('user_message', { message: formattedDate });
    setMessages(prev => [...prev, { sender: 'user', text: formattedDate }]);
    setShowDatePicker(false);
    setIsTyping(true);
  };

  const endChat = () => {
    if (!socket) return;
    
    socket.emit('booking_completed');
    setChatEnded(true);
  };

  return (
    <div className="w-full max-w-lg h-[600px] mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl overflow-hidden border border-blue-100 dark:border-blue-900 shadow-xl flex flex-col">
      <ChatHeader 
        title={websiteInfo?.title || "AI Assistant"}
        chatEnded={chatEnded}
      />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {loading && <LoadingIndicator />}
        
        {error && <ErrorMessage message={error} />}
        
        {isConnected && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 3v5m0 4v3m-3-8 1.5 2.5M8.4 4.6 6 7m12-2.4L15.6 7m-8.3 5.4L4.8 10M18 10l-2.5 2.4" /><circle cx="12" cy="12" r="10" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Welcome to {websiteInfo?.title || "AI Assistant"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
              I'm here to assist you with booking services. May I know your name?
            </p>
          </div>
        )}

        <MessageList messages={messages} />

        {phoneError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
            {phoneError}
          </div>
        )}

        <ServiceSelection 
          categories={categories}
          services={services}
          showServiceSelection={showServiceSelection}
          onCategorySelect={handleCategorySelect}
          onServiceSelect={handleServiceSelect}
        />

        {showDatePicker && (
          <DateSelection onDateSelect={handleDateSelect} />
        )}

        {bookingComplete && !chatEnded && (
          <div className="flex justify-center animate-fadeIn mt-4">
            <button
              onClick={endChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
            >
              Complete Booking
            </button>
          </div>
        )}

        {chatEnded && contactDetails && (
          <ContactDetails contactDetails={contactDetails} websiteTitle={websiteInfo?.title || "AI Assistant"} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="flex items-center space-x-2 px-4 py-2 text-blue-500">
          <div className="flex space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_ease-in-out_0s]"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_ease-in-out_0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_ease-in-out_0.4s]"></span>
          </div>
          <p className="text-xs text-blue-500 font-light">Assistant is typing...</p>
        </div>
      )}

      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={!isConnected || loading || chatEnded || showDatePicker}
      />
    </div>
  );
};

export default ChatInterface;