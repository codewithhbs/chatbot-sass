import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
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

// Local storage helper with timestamp
const createStorageKey = (websiteInfo: any) => {
  return `chat_session_${websiteInfo?.domain || 'default'}`
}

const getStoredSession = (key: string) => {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const data = JSON.parse(stored)
    const now = Date.now()
    const sessionAge = now - data.timestamp

    // Reset after 24 hours
    if (sessionAge > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key)
      return null
    }

    return data
  } catch {
    return null
  }
}

const setStoredSession = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }))
  } catch {
    // Handle storage quota exceeded
  }
}

// Custom hook for chat state management
const useChatState = (websiteInfo: any) => {
  const storageKey = useMemo(() => createStorageKey(websiteInfo), [websiteInfo])

  const [state, setState] = useState(() => {
    const stored = getStoredSession(storageKey)
    return {
      messages: stored?.messages || [],
      isChatOpen: stored?.isChatOpen || false,
      chatEnded: stored?.chatEnded || false,
      ...stored
    }
  })

  // Debounced save to localStorage
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => {
      const newState = { ...prev, ...updates }

      // Debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        setStoredSession(storageKey, newState)
      }, 1000)

      return newState
    })
  }, [storageKey])

  return [state, updateState] as const
}

const ChatInterface: React.FC = () => {
  const { socket, isConnected, loading, error, websiteInfo } = useSocket()
  const [chatState, updateChatState] = useChatState(websiteInfo)
  const [isTyping, setIsTyping] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [showServiceSelection, setShowServiceSelection] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [contactDetails, setContactDetails] = useState<ContactDetailsType | null>(null)
  const [complaintText, setComplaintText] = useState("")
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Detect if running in iframe
  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top
    } catch {
      return true
    }
  }, [])

  // Auto-scroll with smooth behavior
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages, scrollToBottom])

  // Initialize chat when opening for first time
  const initializeChat = useCallback(() => {
    if (socket && !chatState.chatEnded) {
      console.log("Initializing chat session")
      socket.emit("start_chat", { websiteInfo })
    }
  }, [socket, chatState.chatEnded, websiteInfo])

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    const newState = !chatState.isChatOpen
    updateChatState({ isChatOpen: newState })

    if (newState && !chatState.messages.length) {
      initializeChat()
    }
  }, [chatState.isChatOpen, chatState.messages.length, updateChatState, initializeChat])

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    const handleChunk = (data: { chunk?: string }) => {
      setIsTyping(true)
      updateChatState(prev => {
        const messages = [...prev.messages]
        const lastMessage = messages[messages.length - 1]

        if (lastMessage?.sender === "ai") {
          lastMessage.text += data?.chunk || ""
        } else {
          messages.push({ sender: "ai", text: data?.chunk || "" })
        }

        return { messages }
      })
    }

    const handleComplete = () => setIsTyping(false)
    const handleShowCategories = (categoryData: Category[]) => setCategories(categoryData)
    const handleShowServices = (serviceData: string[]) =>
      setServices(serviceData.map(name => ({ name })))
    const handleShowDatePicker = () => setShowDatePicker(true)
    const handleContactDetails = (details: ContactDetailsType) => setContactDetails(details)
    const handleBookingComplete = () => updateChatState({ bookingComplete: true })
    const handleComplaintComplete = () => updateChatState({ complaintComplete: true })
    const handleShowComplaintForm = () => setShowComplaintForm(true)

    // Register event listeners
    const events = [
      ["ai_reply", handleChunk],
      ["ai_complete", handleComplete],
      ["_show_categories", handleShowCategories],
      ["_show_services", handleShowServices],
      ["_show_date_picker", handleShowDatePicker],
      ["blueace_contact_details", handleContactDetails],
      ["booking_done", handleBookingComplete],
      ["complaint_done", handleComplaintComplete],
      ["show_complaint_form", handleShowComplaintForm],
    ] as const

    events.forEach(([event, handler]) => socket.on(event, handler))

    return () => {
      events.forEach(([event, handler]) => socket.off(event, handler))
    }
  }, [socket, updateChatState])

  // Message handlers
  const handleSendMessage = useCallback((text: string) => {
    if (!socket || !text.trim() || chatState.chatEnded) return

    const newMessage = { sender: "user" as const, text }
    updateChatState(prev => ({
      messages: [...prev.messages, newMessage]
    }))

    socket.emit("user_message", { message: text })
    setIsTyping(true)
  }, [socket, chatState.chatEnded, updateChatState])

  const handleCategorySelect = useCallback((category: string) => {
    if (!socket) return
    socket.emit("user_category_selected", category)
    setShowServiceSelection(true)
  }, [socket])

  const handleServiceSelect = useCallback((service: string) => {
    if (!socket) return
    socket.emit("user_service_selected", service)
    setServices([])
    setCategories([])
    setShowServiceSelection(false)
  }, [socket])

  const handleDateSelect = useCallback((date: Date) => {
    if (!socket) return

    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const newMessage = { sender: "user" as const, text: formattedDate }
    updateChatState(prev => ({
      messages: [...prev.messages, newMessage]
    }))

    socket.emit("user_message", { message: formattedDate })
    setShowDatePicker(false)
    setIsTyping(true)
  }, [socket, updateChatState])

  const handleComplaintSubmit = useCallback(() => {
    if (!socket || !complaintText.trim() || complaintText.length < 20) {
      setPhoneError("Please provide a detailed description (at least 20 characters)")
      return
    }

    const newMessage = { sender: "user" as const, text: complaintText }
    updateChatState(prev => ({
      messages: [...prev.messages, newMessage]
    }))

    socket.emit("user_message", { message: complaintText })
    setShowComplaintForm(false)
    setIsTyping(true)
    setPhoneError("")
    setComplaintText("")
  }, [socket, complaintText, updateChatState])

  const endChat = useCallback(() => {
    if (!socket) return
    socket.emit("booking_completed")
    updateChatState({ chatEnded: true })
  }, [socket, updateChatState])

  const endComplaint = useCallback(() => {
    if (!socket) return
    socket.emit("complaint_completed")
    updateChatState({ chatEnded: true })
  }, [socket, updateChatState])

  // Complaint form component
  const ComplaintForm = useMemo(() => (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-600 animate-slideUp">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Tell us about your issue
        </h3>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
        Please describe your concern in detail so we can assist you better (minimum 20 characters)
      </p>

      <div className="relative">
        <textarea
          className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                     focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 
                     transition-all duration-200 min-h-[120px] resize-none"
          placeholder="Describe your issue here..."
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {complaintText.length}/20 min
        </div>
      </div>

      {phoneError && (
        <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {phoneError}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={handleComplaintSubmit}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform ${complaintText.length >= 20
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          disabled={complaintText.length < 20}
        >
          Submit Complaint
        </button>
      </div>
    </div>
  ), [complaintText, phoneError, handleComplaintSubmit])

  // Chat button for collapsed state
  const ChatButton = useMemo(() => (
    <button
      onClick={toggleChat}
      className="group fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 
                 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl 
                 hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 
                 z-50 animate-bounce-slow"
      aria-label="Open chat"
    >
      <div className="relative flex items-center justify-center">
        <svg
          className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      </div>
    </button>
  ), [toggleChat])

  // Responsive container styles
  const containerStyles = useMemo(() => {
    const baseStyles = "fixed bg-white dark:bg-gray-900/98 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-500 ease-out z-50"

    if (isInIframe) {
      return `${baseStyles} inset-2 rounded-2xl`
    }

    // Desktop: bottom-right positioned
    return `${baseStyles} bottom-6 right-6 w-96 h-[32rem] rounded-2xl animate-slideUp`
  }, [isInIframe])

  if (!chatState.isChatOpen) {
    return ChatButton
  }

  return (
    <div className={containerStyles} ref={chatContainerRef}>
      {/* Close button */}
      <button
        onClick={toggleChat}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full 
                   bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 
                   hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300
                   transition-all duration-200 group"
        aria-label="Close chat"
      >
        <svg
          className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <ChatHeader title={websiteInfo?.title || "AI Assistant"} chatEnded={chatState.chatEnded} />

      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {loading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} />}

        {/* Welcome state */}
        {isConnected && chatState.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Welcome to {websiteInfo?.title || "AI Assistant"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              I'm here to assist you with bookings and complaints. How can I help you today?
            </p>
          </div>
        )}

        <MessageList messages={chatState.messages} />

        {/* Error messages */}
        {phoneError && !showComplaintForm && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm animate-slideUp">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {phoneError}
            </div>
          </div>
        )}

        {/* Forms and selections */}
        {showComplaintForm && ComplaintForm}

        <ServiceSelection
          categories={categories}
          services={services}
          showServiceSelection={showServiceSelection}
          onCategorySelect={handleCategorySelect}
          onServiceSelect={handleServiceSelect}
        />

        {showDatePicker && <DateSelection onDateSelect={handleDateSelect} />}

        {/* Action buttons */}
        {chatState.bookingComplete && !chatState.chatEnded && (
          <div className="flex justify-center animate-fadeIn">
            <button
              onClick={endChat}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                         text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Complete Booking
            </button>
          </div>
        )}

        {chatState.complaintComplete && !chatState.chatEnded && (
          <div className="flex justify-center animate-fadeIn">
            <button
              onClick={endComplaint}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                         text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Submit Complaint
            </button>
          </div>
        )}

        {/* Contact details */}
        {chatState.chatEnded && contactDetails && (
          <ContactDetails
            contactDetails={contactDetails}
            websiteTitle={websiteInfo?.title || "AI Assistant"}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-3 px-4 py-3 text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
          </div>
          <p className="text-sm font-medium">Assistant is typing...</p>
        </div>
      )}

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!isConnected || loading || chatState.chatEnded || showDatePicker || showComplaintForm}
      />
    </div>
  )
}

export default React.memo(ChatInterface)