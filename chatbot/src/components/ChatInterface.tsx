import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSocket } from "../context/SocketContext"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import ServiceSelection from "./ServiceSelection"
import DateSelection from "./DateSelection"
import ContactDetails from "./ContactDetails"
import ChatHeader from "./ChatHeader"
import LoadingIndicator from "./LoadingIndicator"
import ErrorMessage from "./ErrorMessage"
import type { Message, Category, Service, ContactDetailsType } from "../types"

const ChatInterface: React.FC = () => {
  const { socket, isConnected, loading, error, websiteInfo } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [showServiceSelection, setShowServiceSelection] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [contactDetails, setContactDetails] = useState<ContactDetailsType | null>(null)
  const [chatEnded, setChatEnded] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [complaintComplete, setComplaintComplete] = useState(false)
  const [complaintText, setComplaintText] = useState("")
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // New state for chat visibility
  const [isChatOpen, setIsChatOpen] = useState(false)
  console.log("websiteInfo", websiteInfo)
  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev)

    // When opening chat for the first time, initialize it
    if (!isChatOpen && socket) {
      console.log("Emitting start_chat event");
      socket.emit("start_chat", {})
    } else {
      console.log("Chat already open or socket not available");
    }
  }

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showContactDetails, showComplaintForm])

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleChunk = (data: { chunk?: string }) => {
      setIsTyping(true)
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.sender === "ai") {
          return [...prev.slice(0, -1), { ...last, text: last.text + (data?.chunk || "") }]
        } else {
          return [...prev, { sender: "ai", text: data?.chunk || "" }]
        }
      })
    }

    const handleShowCategories = (categoryData: Category[]) => {
      setCategories(categoryData)
    }

    const handleShowServices = (serviceData: string[]) => {
      setServices(serviceData.map((name) => ({ name })))
    }

    const handleComplete = () => {
      setIsTyping(false)
    }

    const handleShowDatePicker = () => {
      setShowDatePicker(true)
    }

    const handleContactDetails = (details: ContactDetailsType) => {
      setContactDetails(details)
      setShowContactDetails(true)
    }

    const handleBookingComplete = () => {
      setBookingComplete(true)
    }

    const handleComplaintComplete = () => {
      setComplaintComplete(true)
    }

    socket.on("ai_reply", handleChunk)
    socket.on("ai_complete", handleComplete)
    socket.on("_show_categories", handleShowCategories)
    socket.on("_show_services", handleShowServices)
    socket.on("_show_date_picker", handleShowDatePicker)
    socket.on("blueace_contact_details", handleContactDetails)
    socket.on("booking_done", handleBookingComplete)
    socket.on("complaint_done", handleComplaintComplete)
    socket.on("show_complaint_form", () => setShowComplaintForm(true))

    return () => {
      socket.off("ai_reply", handleChunk)
      socket.off("ai_complete", handleComplete)
      socket.off("_show_categories", handleShowCategories)
      socket.off("_show_services", handleShowServices)
      socket.off("_show_date_picker", handleShowDatePicker)
      socket.off("blueace_contact_details", handleContactDetails)
      socket.off("booking_done", handleBookingComplete)
      socket.off("complaint_done", handleComplaintComplete)
      socket.off("show_complaint_form", () => setShowComplaintForm(false))
    }
  }, [socket])

  const handleCategorySelect = (category: string) => {
    if (!socket) return

    socket.emit("user_category_selected", category)
    setShowServiceSelection(true)
  }

  const handleServiceSelect = (service: string) => {
    if (!socket) return

    socket.emit("user_service_selected", service)
    setServices([])
    setCategories([])
    setShowServiceSelection(false)
  }

  const handleSendMessage = (text: string) => {
    if (!socket || !text.trim() || chatEnded) return

    socket.emit("user_message", { message: text })
    setMessages((prev) => [...prev, { sender: "user", text: text }])
    setIsTyping(true)
  }

  const handleDateSelect = (date: Date) => {
    if (!socket) return

    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    socket.emit("user_message", { message: formattedDate })
    setMessages((prev) => [...prev, { sender: "user", text: formattedDate }])
    setShowDatePicker(false)
    setIsTyping(true)
  }

  const handleComplaintSubmit = () => {
    if (!socket || !complaintText.trim() || complaintText.length < 20) {
      setPhoneError("Please provide a detailed description (at least 20 characters)")
      return
    }

    socket.emit("user_message", { message: complaintText })
    setMessages((prev) => [...prev, { sender: "user", text: complaintText }])
    setShowComplaintForm(false)
    setIsTyping(true)
    setPhoneError("")
  }

  const endChat = () => {
    if (!socket) return

    socket.emit("booking_completed")
    setChatEnded(true)
  }

  const endComplaint = () => {
    if (!socket) return

    socket.emit("complaint_completed")
    setChatEnded(true)
  }

  const ComplaintForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md animate-fadeIn mb-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
        Complaint Details
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
        Please describe your issue in detail (minimum 20 characters)
      </p>
      <textarea
        className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 
                   dark:border-gray-600 min-h-[100px]"
        placeholder="Describe your issue here..."
        value={complaintText}
        onChange={(e) => setComplaintText(e.target.value)}
      />
      {phoneError && (
        <p className="text-red-500 text-xs mt-1">{phoneError}</p>
      )}
      <div className="flex justify-end mt-3">
        <button
          onClick={handleComplaintSubmit}
          className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${complaintText.length >= 20
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
            }`}
          disabled={complaintText.length < 20}
        >
          Submit Complaint
        </button>
      </div>
    </div>
  )

  return (
    <>
      {!isChatOpen ? (
        <div
          className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-all z-50"
          onClick={toggleChat}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full  mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl overflow-hidden border border-blue-100 dark:border-blue-900 shadow-xl flex flex-col relative">
            <button
              onClick={toggleChat}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <ChatHeader title={websiteInfo?.title || "AI Assistant"} chatEnded={chatEnded} />

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
              {loading && <LoadingIndicator />}

              {error && <ErrorMessage message={error} />}

              {isConnected && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Welcome to {websiteInfo?.title || "AI Assistant"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                    I'm here to assist you with bookings and complaints. May I know your name?
                  </p>
                </div>
              )}

              <MessageList messages={messages} />

              {phoneError && !showComplaintForm && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
                  {phoneError}
                </div>
              )}

              {showComplaintForm && <ComplaintForm />}

              <ServiceSelection
                categories={categories}
                services={services}
                showServiceSelection={showServiceSelection}
                onCategorySelect={handleCategorySelect}
                onServiceSelect={handleServiceSelect}
              />

              {showDatePicker && <DateSelection onDateSelect={handleDateSelect} />}

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

              {complaintComplete && !chatEnded && (
                <div className="flex justify-center animate-fadeIn mt-4">
                  <button
                    onClick={endComplaint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                  >
                    Submit Complaint
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
              disabled={!isConnected || loading || chatEnded || showDatePicker || showComplaintForm}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ChatInterface