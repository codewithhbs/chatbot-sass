import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ServiceSelection from "./ServiceSelection";
import DateSelection from "./DateSelection";
import ContactDetails from "./ContactDetails";
import ChatHeader from "./ChatHeader";

import type { Message, Category, Service, ContactDetailsType } from "../types";

const ChatInterface: React.FC = () => {
  const { socket, isConnected, loading, error, websiteInfo } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetailsType | null>(null);
  const [chatEnded, setChatEnded] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [complaintComplete, setComplaintComplete] = useState(false);
  const [showBookingComplaintButtons, setShowBookingComplaintButtons] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on component mount
  useEffect(() => {
    if (socket && !chatInitialized) {
      socket.emit("start_chat", {});
      setChatInitialized(true);
    }
  }, [socket, chatInitialized]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showContactDetails]);

  // Check if AI reply contains booking/complaint prompt
  const checkForBookingComplaintPrompt = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('booking') && lowerText.includes('complaint') &&
      (lowerText.includes('type') || lowerText.includes('please'))) {
      setShowBookingComplaintButtons(true);
    }
  };

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleChunk = (data: { chunk?: string }) => {
      setIsTyping(true);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.sender === "ai") {
          const updatedText = last.text + (data?.chunk || "");
          checkForBookingComplaintPrompt(updatedText);
          return [...prev.slice(0, -1), { ...last, text: updatedText }];
        } else {
          const newText = data?.chunk || "";
          checkForBookingComplaintPrompt(newText);
          return [...prev, { sender: "ai", text: newText }];
        }
      });
    };

    const handleShowCategories = (categoryData: Category[]) => {
      setCategories(categoryData);
    };

    const handleShowServices = (serviceData: string[]) => {
      setServices(serviceData.map((name) => ({ name })));
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

    const handleComplaintComplete = () => {
      setComplaintComplete(true);
    };

    socket.on("ai_reply", handleChunk);
    socket.on("ai_complete", handleComplete);
    socket.on("_show_categories", handleShowCategories);
    socket.on("_show_services", handleShowServices);
    socket.on("_show_date_picker", handleShowDatePicker);
    socket.on("blueace_contact_details", handleContactDetails);
    socket.on("booking_done", handleBookingComplete);
    socket.on("complaint_done", handleComplaintComplete);

    return () => {
      socket.off("ai_reply", handleChunk);
      socket.off("ai_complete", handleComplete);
      socket.off("_show_categories", handleShowCategories);
      socket.off("_show_services", handleShowServices);
      socket.off("_show_date_picker", handleShowDatePicker);
      socket.off("blueace_contact_details", handleContactDetails);
      socket.off("booking_done", handleBookingComplete);
      socket.off("complaint_done", handleComplaintComplete);
    };
  }, [socket]);

  const handleCategorySelect = (category: string) => {
    if (!socket) return;
    socket.emit("user_category_selected", category);
    setShowServiceSelection(true);
  };

  const handleServiceSelect = (service: string) => {
    if (!socket) return;
    socket.emit("user_service_selected", service);
    setServices([]);
    setCategories([]);
    setShowServiceSelection(false);
  };

  const handleSendMessage = (text: string) => {
    if (!socket || !text.trim() || chatEnded) return;
    socket.emit("user_message", { message: text });
    setMessages((prev) => [...prev, { sender: "user", text: text }]);
    setIsTyping(true);
    setShowBookingComplaintButtons(false);
  };

  const handleDateSelect = (date: Date) => {
    if (!socket) return;
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    socket.emit("user_message", { message: formattedDate });
    setMessages((prev) => [...prev, { sender: "user", text: formattedDate }]);
    setShowDatePicker(false);
    setIsTyping(true);
  };

  const handleBookingClick = () => {
    handleSendMessage("booking");
  };

  const handleComplaintClick = () => {
    handleSendMessage("complaint");
  };

  const endChat = () => {
    if (!socket) return;
    socket.emit("booking_completed");
    setChatEnded(true);
  };

  const endComplaint = () => {
    if (!socket) return;
    socket.emit("complaint_completed");
    setChatEnded(true);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center ">
      <div className="w-full max-w-4xl h-full  bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
                     overflow-hidden border border-white/20 dark:border-gray-700/50 
                      shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]
                      flex flex-col relative">

        <ChatHeader
          title={websiteInfo?.title || "AI Assistant"}
          chatEnded={chatEnded}
        />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 scroll-smooth 
                        scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-gray-600 
                        scrollbar-track-transparent">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 dark:border-blue-800/50 rounded-full animate-spin">
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 
                                  border-r-purple-500 rounded-full animate-spin"></div>
                </div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-pink-400 
                                border-l-cyan-400 rounded-full animate-spin [animation-direction:reverse] 
                                [animation-duration:1.5s]"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 
                               bg-clip-text text-transparent">Initializing Chat</h3>
                <p className="text-gray-600 dark:text-gray-400">Connecting you to our AI assistant...</p>
                <div className="flex items-center justify-center space-x-1 mt-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 
                                dark:to-orange-900/20 rounded-full flex items-center justify-center 
                                animate-pulse shadow-lg">
                  <svg className="w-10 h-10 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Connection Failed</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 
                             hover:from-red-600 hover:to-orange-600 text-white rounded-2xl 
                             font-medium transition-all duration-300 transform hover:scale-105 
                             shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          )}

          {/* Chat Content */}
          {!loading && !error && (
            <>
              <MessageList messages={messages} />

              {/* Enhanced Booking/Complaint Buttons */}
              {showBookingComplaintButtons && !isTyping && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      How can I help you today?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose one of the options below
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button
                      onClick={handleBookingClick}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 
                                 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800 text-white 
                                 rounded-2xl p-6 transition-all duration-500 transform hover:scale-105 
                                 shadow-[0_8px_32px_-4px_rgba(59,130,246,0.5)] hover:shadow-[0_12px_40px_-4px_rgba(59,130,246,0.7)]
                                 border border-blue-400/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 
                                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                      transition-transform duration-700"></div>
                      <div className="relative flex items-center justify-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-full">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-lg">Make Booking</p>
                          <p className="text-sm text-blue-100">Schedule your appointment</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleComplaintClick}
                      className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 
                                 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 text-white 
                                 rounded-2xl p-6 transition-all duration-500 transform hover:scale-105 
                                 shadow-[0_8px_32px_-4px_rgba(239,68,68,0.5)] hover:shadow-[0_12px_40px_-4px_rgba(239,68,68,0.7)]
                                 border border-red-400/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 
                                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                      transition-transform duration-700"></div>
                      <div className="relative flex items-center justify-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-full">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-lg">File Complaint</p>
                          <p className="text-sm text-red-100">Report an issue</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <ServiceSelection
                categories={categories}
                services={services}
                showServiceSelection={showServiceSelection}
                onCategorySelect={handleCategorySelect}
                onServiceSelect={handleServiceSelect}
              />

              {showDatePicker && <DateSelection onDateSelect={handleDateSelect} />}

              {bookingComplete && !chatEnded && (
                <CompleteButton onClick={endChat} text="Complete Booking" />
              )}

              {complaintComplete && !chatEnded && (
                <CompleteButton onClick={endComplaint} text="Complete Complaint" />
              )}

              {(chatEnded || contactDetails) && (
                <ContactDetails
                  contactDetails={contactDetails}
                  websiteTitle={websiteInfo?.title || "AI Assistant"}
                />
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Enhanced Typing Indicator */}
        {isTyping && !loading && (
          <div className="px-6 py-4 border-t border-white/10 dark:border-gray-700/50 
                          bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full 
                                animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full 
                                animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full 
                                animate-bounce"></div>
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 
                               bg-clip-text text-transparent">
                Assistant is thinking...
              </span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected || loading || chatEnded || showDatePicker || error !== null}
        />
      </div>
    </div>
  );
};

const CompleteButton: React.FC<{
  onClick: () => void;
  text: string;
}> = ({ onClick, text }) => (
  <div className="flex justify-center animate-fadeIn mt-6 mb-2">
    <button
      onClick={onClick}
      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium
                 transform hover:scale-105 flex items-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{text}</span>
    </button>
  </div>
);

export default ChatInterface;