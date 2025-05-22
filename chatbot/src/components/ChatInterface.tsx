import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ServiceSelection from "./ServiceSelection";
import DateSelection from "./DateSelection";
import ContactDetails from "./ContactDetails";
import ChatHeader from "./ChatHeader";
import LoadingIndicator from "./LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import ChatButton from "./ChatButton";
import type { Message, Category, Service, ContactDetailsType } from "../types";

const ChatInterface: React.FC = () => {
  const { socket, isConnected, loading, error, websiteInfo } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetailsType | null>(null);
  const [chatEnded, setChatEnded] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [complaintComplete, setComplaintComplete] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for chat visibility with animation states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Toggle chat visibility with animation handling
  const toggleChat = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (!isChatOpen) {
      setIsChatOpen(true);
      // When opening chat for the first time, initialize it
      if (socket) {
        socket.emit("start_chat", {});
      }
    } else {
      // Allow time for close animation
      setTimeout(() => {
        setIsChatOpen(false);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Reset animation state after opening animation completes
  useEffect(() => {
    if (isChatOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showContactDetails, showComplaintForm]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleChunk = (data: { chunk?: string }) => {
      setIsTyping(true);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.sender === "ai") {
          return [...prev.slice(0, -1), { ...last, text: last.text + (data?.chunk || "") }];
        } else {
          return [...prev, { sender: "ai", text: data?.chunk || "" }];
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
      console.log("Contact Details:", details);
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
    socket.on("show_complaint_form", () => setShowComplaintForm(true));

    return () => {
      socket.off("ai_reply", handleChunk);
      socket.off("ai_complete", handleComplete);
      socket.off("_show_categories", handleShowCategories);
      socket.off("_show_services", handleShowServices);
      socket.off("_show_date_picker", handleShowDatePicker);
      socket.off("blueace_contact_details", handleContactDetails);
      socket.off("booking_done", handleBookingComplete);
      socket.off("complaint_done", handleComplaintComplete);
      socket.off("show_complaint_form", () => setShowComplaintForm(false));
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

  const handleComplaintSubmit = () => {
    if (!socket || !complaintText.trim() || complaintText.length < 20) {
      setPhoneError("Please provide a detailed description (at least 20 characters)");
      return;
    }

    socket.emit("user_message", { message: complaintText });
    setMessages((prev) => [...prev, { sender: "user", text: complaintText }]);
    setShowComplaintForm(false);
    setIsTyping(true);
    setPhoneError("");
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
    <>
      <ChatButton
        isChatOpen={isChatOpen}
        onClick={toggleChat}
        websiteInfo={websiteInfo}
      />

      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  sm:p-6 md:p-8">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={toggleChat}
          />

          <div
            className={`w-full h-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-900 backdrop-blur-md rounded-2xl 
                        overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col relative
                        transition-all duration-300 ease-out ${isAnimating && isChatOpen ? 'animate-scaleUp' :
                isAnimating && !isChatOpen ? 'animate-scaleDown' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <ChatHeader
              title={websiteInfo?.title || "AI Assistant"}
              chatEnded={chatEnded}
              onClose={toggleChat}
            />

            <div
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth"
              style={{
                overscrollBehavior: 'contain'
              }}
            >
              {loading && <LoadingIndicator />}

              {error && <ErrorMessage message={error} />}

              {isConnected && messages.length === 0 && (
                <div className="min-h-[30vh] flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 shadow-inner">
                    <div className="animate-pulse">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-500"
                      >
                        <path d="M12 3v5m0 4v3m-3-8 1.5 2.5M8.4 4.6 6 7m12-2.4L15.6 7m-8.3 5.4L4.8 10M18 10l-2.5 2.4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Welcome to {websiteInfo?.title || "AI Assistant"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                    I'm here to assist you with bookings and complaints. May I know your name?
                  </p>
                </div>
              )}

              <MessageList messages={messages} />

              {phoneError && !showComplaintForm && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                  {phoneError}
                </div>
              )}

              {showComplaintForm && (
                <ComplaintForm
                  complaintText={complaintText}
                  setComplaintText={setComplaintText}
                  phoneError={phoneError}
                  handleSubmit={handleComplaintSubmit}
                />
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
                <CompleteButton
                  onClick={endChat}
                  text="Complete Booking"
                />
              )}

              {complaintComplete && !chatEnded && (
                <CompleteButton
                  onClick={endComplaint}
                  text="Submit Complaint"
                />
              )}

              {(chatEnded || contactDetails) && (
                <ContactDetails
                  contactDetails={contactDetails}
                  websiteTitle={websiteInfo?.title || "AI Assistant"}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {isTyping && <TypingIndicator />}

            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!isConnected || loading || chatEnded || showDatePicker || showComplaintForm}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Extracted components for better organization
const ComplaintForm: React.FC<{
  complaintText: string;
  setComplaintText: (text: string) => void;
  phoneError: string;
  handleSubmit: () => void;
}> = ({ complaintText, setComplaintText, phoneError, handleSubmit }) => (
  <div className="bg-white dark:bg-gray-800/70 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700/50 animate-fadeIn mb-4 backdrop-blur-sm">
    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
      Complaint Details
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
      Please describe your issue in detail (minimum 20 characters)
    </p>
    <textarea
      className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 
                rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/50 
                backdrop-blur-sm min-h-[120px] transition-all duration-200"
      placeholder="Describe your issue here..."
      value={complaintText}
      onChange={(e) => setComplaintText(e.target.value)}
    />
    {phoneError && (
      <p className="text-red-500 text-xs mt-2 pl-1">{phoneError}</p>
    )}
    <div className="flex justify-end mt-4">
      <button
        onClick={handleSubmit}
        className={`px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-200 
                  ${complaintText.length >= 20
            ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            : "bg-gray-400 cursor-not-allowed opacity-70"
          }`}
        disabled={complaintText.length < 20}
      >
        Submit Complaint
      </button>
    </div>
  </div>
);

const CompleteButton: React.FC<{
  onClick: () => void;
  text: string;
}> = ({ onClick, text }) => (
  <div className="flex justify-center animate-fadeIn mt-6 mb-2">
    <button
      onClick={onClick}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md 
                hover:shadow-lg transition-all duration-200 font-medium"
    >
      {text}
    </button>
  </div>
);

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 px-4 py-2 text-blue-500 animate-fadeIn">
    <div className="flex space-x-1">
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_ease-in-out_0s]"></span>
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_ease-in-out_0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_ease-in-out_0.4s]"></span>
    </div>
    <p className="text-xs text-blue-500 font-light">Assistant is typing...</p>
  </div>
);

export default ChatInterface;