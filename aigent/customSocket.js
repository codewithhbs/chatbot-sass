// handleSocket.js
const User = require("./models/User");
const WebsiteSchema = require("./models/Website.Schema");
const Chat = require("./models/Chat.Schema");
const Booking = require("./models/CustomBooking");
const BotConfig = require("./models/BotConfig");
const { CallGemini } = require("./gemini"); // Import the Gemini service

const userStates = {};

// Improved validators with better handling for non-required fields
const validators = {
  text: (value, validation) => {
    // If validation is not defined, always return true
    if (!validation) return true;
    
    // Check if required is true and value is empty
    if (validation.required && (!value || value.trim() === '')) {
      return false;
    }
    
    // If not required and value is empty, skip pattern validation
    if (!validation.required && (!value || value.trim() === '')) {
      return true;
    }
    
    // Check pattern only if there's a valid pattern and a value to check
    if (validation.pattern && validation.pattern.trim() !== '' && value) {
      try {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return false;
        }
      } catch (e) {
        // If pattern is invalid, log error and skip pattern validation
        console.error("Invalid regex pattern:", validation.pattern, e);
      }
    }
    
    return true;
  },
  email: (value, validation) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (validation?.required && (!value || value.trim() === '')) {
      return false;
    }
    return !value || emailRegex.test(value);
  },
  phone: (value, validation) => {
    // Basic phone validation - can be customized based on country/format needs
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (validation?.required && (!value || value.trim() === '')) {
      return false;
    }
    return !value || phoneRegex.test(value.replace(/[\s()-]/g, ''));
  },
  date: (value, validation) => {
    if (validation?.required && (!value || value.trim() === '')) {
      return false;
    }
    if (!value) return true;
    
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
};

// New booking handling functions
const bookingService = {
  // Check availability for a date and time
  checkAvailability: async (date, timeSlot, serviceId, metaCode) => {
    try {
      // Logic to check if the slot is available
      const existingBookings = await Booking.find({
        metaCode: metaCode,
        'timing.requestedDate': date,
        'timing.requestedTimeSlot': timeSlot,
        status: { $in: ['pending', 'confirmed'] }
      });
      
      // Get service duration and other constraints from database
      // This would depend on your service configuration
      
      return existingBookings.length === 0;
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    }
  },
  
  // Get available time slots for a date
  getAvailableTimeSlots: async (date, serviceId, metaCode) => {
    try {
      // This would fetch business hours and booked slots from database
      // For simplicity, we'll return mock data
      const businessHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
      
      const bookedSlots = await Booking.find({
        metaCode: metaCode,
        'timing.requestedDate': new Date(date),
        status: { $in: ['pending', 'confirmed'] }
      }).select('timing.requestedTimeSlot');
      
      const bookedTimes = bookedSlots.map(booking => booking.timing.requestedTimeSlot);
      
      return businessHours.filter(time => !bookedTimes.includes(time));
    } catch (error) {
      console.error("Error getting available slots:", error);
      return [];
    }
  },
  
  // Create a new booking
  createBooking: async (bookingData, chatId, metaCode) => {
    try {
      const newBooking = new Booking({
        chatId: chatId,
        metaCode: metaCode,
        ...bookingData,
        statusHistory: [{
          status: 'requested',
          timestamp: new Date(),
          note: 'Booking requested via chatbot'
        }]
      });
      console.log("Create Come")
      
      const savedBooking = await newBooking.save();
      
      // Schedule notifications/reminders
      await savedBooking.scheduleReminders();
      
      return savedBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },
  
  // Process booking from chat flow
  processBookingFromChat: async (user, chatId, metaCode) => {
    // Collect booking information from chat responses
    const bookingData = {
      customerInfo: {
        name: user.responses['step-name'] || '',
        email: user.responses['step-email'] || '',
        phone: user.responses['step-phone'] || '',
        additionalInfo: {}
      },
      bookingType: user.responses['step-service-type'] || 'consultation',
      serviceDetails: {
        serviceName: user.responses['step-service'] || 'General Consultation',
        customRequirements: user.responses['step-requirements'] || ''
      },
      timing: {
        requestedDate: user.responses['step-date'] ? new Date(user.responses['step-date']) : null,
        requestedTimeSlot: user.responses['step-time'] || null,
        duration: 60 // Default to 60 minutes
      },
      communicationPreference: user.responses['step-communication'] || 'email',
      location: {
        type: user.responses['step-location-type'] || 'online'
      },
      source: 'chatbot'
    };
    
    // Add any other collected information
    Object.entries(user.responses).forEach(([key, value]) => {
      if (!key.startsWith('step-')) {
        return;
      }
      
      // Map any other responses to appropriate fields
      if (key.includes('additional-')) {
        bookingData.customerInfo.additionalInfo[key.replace('step-additional-', '')] = value;
      }
    });
    
    return await bookingService.createBooking(bookingData, chatId, metaCode);
  }
};

exports.handleSocketCustom = async (socket, metaCode) => {
  // Fetch website data based on metaCode
  let websiteData;
  try {
    websiteData = await WebsiteSchema.findOne({ metaCode });
    if (!websiteData) {
      console.error("Website not found for metaCode:", metaCode);
      socket.emit("ai_reply", { chunk: "Configuration error. Please contact support." });
      socket.emit("ai_complete");
      return;
    }
  } catch (err) {
    console.error("Error fetching website data:", err);
    socket.emit("ai_reply", { chunk: "Server error. Please try again later." });
    socket.emit("ai_complete");
    return;
  }

  // Fetch bot configuration based on metaCode
  let botConfig;
  try {
    botConfig = await BotConfig.findOne({ metaCode });
    if (!botConfig) {
      console.error("Bot configuration not found for metaCode:", metaCode);
      socket.emit("ai_reply", { chunk: "Bot configuration error. Please contact support." });
      socket.emit("ai_complete");
      return;
    }
  } catch (err) {
    console.error("Error fetching bot configuration:", err);
    socket.emit("ai_reply", { chunk: "Server error. Please try again later." });
    socket.emit("ai_complete");
    return;
  }

  // Create a unique chat ID for this session
  const chatId = `${metaCode}-${socket.id}-${Date.now()}`;
  socket.chatId = chatId;

  // Create a single chat document for the entire conversation
  const newChat = new Chat({
    chatId: chatId,
    metaCode: metaCode,
    messages: [{
      sender: "system",
      message: "Chat started",
      timestamp: new Date()
    }]
  });
  await newChat.save();

  // Improved sendChunks function with better spacing and sentence detection
  const sendChunks = async (socket, message) => {
    if (!message || message.trim() === '') return;
    
    // Split by sentences for more natural pauses
    // This regex splits text into sentences, preserving punctuation and spacing
    const sentences = message.match(/[^.!?]+[.!?]+|\s*\n\s*|\s{2,}|[^.!?\s][^.!?]*$/g) || [message];
    
    for (const sentence of sentences) {
      // For each sentence, send words with proper spacing
      const words = sentence.split(/(\s+)/); // This keeps the spaces as separate elements
      let buffer = '';
      const chunkSize = 3; // Send 3 words at a time for better flow
      
      for (let i = 0; i < words.length; i++) {
        buffer += words[i];
        
        if ((i + 1) % chunkSize === 0 || i === words.length - 1) {
          socket.emit("ai_reply", { chunk: buffer });
          buffer = '';
          // Adjust delay based on punctuation for more natural pauses
          const delay = /[.!?]$/.test(words[i]) ? 300 : 80;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
      
      // Add slight pause between sentences
      await new Promise((res) => setTimeout(res, 200));
    }
    
    socket.emit("ai_complete");
  };

  // Enhanced AI response generation with Gemini API
  const generateAIResponse = async (prompt, context) => {
    try {
      // Only use Gemini for cases where we need dynamic responses
      if (botConfig.useAI && context.needsAIResponse) {
        // Construct a comprehensive prompt with conversation history and context
        const enhancedPrompt = `
          You are an AI assistant for ${websiteData.website_name}, a business focused on digital marketing.
          Your name is ${botConfig.botName || "Marketing Assistant"}.
          
          Customer information gathered so far:
          ${Object.entries(context.responses || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
          
          Current step: ${context.currentStep?.question || "None"}
          
          Customer's latest message: "${prompt}"
          
          Respond in a helpful, professional tone. Keep your response concise and relevant to digital marketing services.
        `;
        
        return await CallGemini(enhancedPrompt);
      }
      
      // Default to using predefined templates when AI isn't needed
      return null;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return null;
    }
  };

  // Add message to the existing chat document
  const addMessageToChat = async (sender, message) => {
    await Chat.findOneAndUpdate(
      { chatId: socket.chatId },
      {
        $push: {
          messages: {
            sender: sender,
            message: message,
            timestamp: new Date()
          }
        },
        lastUpdated: new Date()
      },
      { new: true }
    );
  };

  // Update user information in the chat document
  const updateChatUserInfo = async (userData) => {
    if (Object.keys(userData).length > 0) {
      userData.lastUpdated = new Date();

      await Chat.findOneAndUpdate(
        { chatId: socket.chatId },
        { $set: userData },
        { new: true }
      );
    }
  };

  // Process template with user response
  const processTemplate = (template, response) => {
    if (!template) return "";
    return template.replace(/{response}/g, response);
  };

  // Find step by ID
  const findStepById = (stepId) => {
    return botConfig.steps.find(step => step.stepId === stepId);
  };

  // Find first step (isStart = true)
  const findStartStep = () => {
    return botConfig.steps.find(step => step.isStart === true);
  };

  // Get next step based on current step and user response (for dropdown)
  const getNextStep = (currentStep, response) => {
    if (currentStep.type === "dropdown") {
      const connection = currentStep.optionConnections.find(conn => conn.optionValue === response);
      if (connection && connection.nextStepId) {
        return findStepById(connection.nextStepId);
      }
    }
    
    if (currentStep.defaultNextStepId) {
      return findStepById(currentStep.defaultNextStepId);
    }
    
    return null;
  };

  // Initialize user state
  if (!userStates[socket.id]) {
    userStates[socket.id] = {
      currentStep: findStartStep(),
      responses: {},
      metaCode: metaCode,
      needsAIResponse: false,
      bookingInProgress: false
    };
  }

  // Handler for booking workflow
  const handleBookingWorkflow = async (user, message) => {
    // If this is a designated booking step, set booking flag
    if (user.currentStep.isBookingStep) {
      user.bookingInProgress = true;
    }
    
    // If we're in a booking flow, process special booking validations
    if (user.bookingInProgress) {
      // Special validation for booking fields
      switch (user.currentStep.fieldType) {
        case 'date':
          if (!validators.date(message, user.currentStep.validation)) {
            await sendChunks(socket, "Please provide a valid date in YYYY-MM-DD format.");
            return false;
          }
          
          // Check if date is in the future
          const selectedDate = new Date(message);
          if (selectedDate < new Date()) {
            await sendChunks(socket, "Please select a future date for your booking.");
            return false;
          }
          break;
          
        case 'time':
          // Check if this time slot is available
          const isAvailable = await bookingService.checkAvailability(
            user.responses['step-date'],
            message,
            user.responses['step-service-type'],
            metaCode
          );
          
          if (!isAvailable) {
            // Show available time slots
            const availableSlots = await bookingService.getAvailableTimeSlots(
              user.responses['step-date'],
              user.responses['step-service-type'],
              metaCode
            );
            
            await sendChunks(socket, `This time slot is not available. Available times: ${availableSlots.join(', ')}`);
            return false;
          }
          break;
          
        case 'email':
          if (!validators.email(message, user.currentStep.validation)) {
            await sendChunks(socket, "Please provide a valid email address.");
            return false;
          }
          break;
          
        case 'phone':
          if (!validators.phone(message, user.currentStep.validation)) {
            await sendChunks(socket, "Please provide a valid phone number.");
            return false;
          }
          break;
      }
      
      // If this is the final booking step, create the booking
      if (user.currentStep.isBookingFinal) {
        try {
          const booking = await bookingService.processBookingFromChat(user, socket.chatId, metaCode);
          
          // Send confirmation
          await sendChunks(socket, `Great! Your booking has been confirmed. Booking ID: ${booking.bookingId}`);
          
          // Reset booking flag after successful completion
          user.bookingInProgress = false;
          
          // Update chat with booking reference
          await updateChatUserInfo({ bookingId: booking.bookingId });
        } catch (error) {
          console.error("Error processing booking:", error);
          await sendChunks(socket, "Sorry, we couldn't complete your booking. Please try again later.");
          return false;
        }
      }
    }
    
    return true; // Continue with normal flow
  };

  // Handler for user responses
  const handleUserResponse = async (message) => {
    const user = userStates[socket.id];
    if (!user) return;
    
    await addMessageToChat("user", message);

    const currentStep = user.currentStep;
    console.log(currentStep, "currentStep");
    if (!currentStep) {
      await sendChunks(socket, "I'm not sure how to proceed. Please start over.");
      return;
    }

    // Improved validation logic
    if (currentStep.validation) {
      console.log(currentStep.validation, "validation");
      const isValid = validators.text(message, currentStep.validation);
      if (!isValid) {
        await sendChunks(socket, currentStep.validation.errorMessage || "Invalid input. Please try again.");
        await addMessageToChat("bot", currentStep.validation.errorMessage || "Invalid input. Please try again.");
        return;
      }
    }
    
    // Handle booking specific workflow and validations
    const canContinue = await handleBookingWorkflow(user, message);
    if (!canContinue) return;

    // Store the response
    user.responses[currentStep.stepId] = message;
    
    // Update chat info
    await updateChatUserInfo({ [`response_${currentStep.stepId}`]: message });

    // Check if we need an AI-generated response instead of template
    let responseText;
    
    // Check if this step requires AI-generated response
    const needsAI = currentStep.useAI || botConfig.aiSteps?.includes(currentStep.stepId);
    
    if (needsAI) {
      user.needsAIResponse = true;
      responseText = await generateAIResponse(message, user);
    }
    
    // Fall back to template if no AI response or AI not needed
    if (!responseText && currentStep.responseTemplate) {
      responseText = processTemplate(currentStep.responseTemplate, message);
    }
    
    // Send response if available
    if (responseText) {
      await sendChunks(socket, responseText);
      await addMessageToChat("bot", responseText);
    }

    // Get next step
    const nextStep = getNextStep(currentStep, message);
    user.currentStep = nextStep;

    // If there's a next step, send its question
    if (nextStep) {
      await sendChunks(socket, nextStep.question);
      await addMessageToChat("bot", nextStep.question);

      // If dropdown, send options
      if (nextStep.type === "dropdown") {
        socket.emit("show_options", nextStep.options);
      }
      
      // If date selection, send available dates
      if (nextStep.fieldType === 'date') {
        // Could send date restrictions or calendar widget trigger
        socket.emit("show_date_picker");
      }
      
      // If time selection and we have a date, send available times
      if (nextStep.fieldType === 'time' && user.responses['step-date']) {
        const availableTimes = await bookingService.getAvailableTimeSlots(
          user.responses['step-date'],
          user.responses['step-service-type'],
          metaCode
        );
        socket.emit("show_time_slots", availableTimes);
      }
    } else if (currentStep.isEnd) {
      // End of the flow
      await sendChunks(socket, botConfig.endMessage || "Thank you for chatting with us!");
      await addMessageToChat("bot", botConfig.endMessage || "Thank you for chatting with us!");
      
      // Update chat status to completed
      await Chat.findOneAndUpdate(
        { chatId: socket.chatId },
        { $set: { status: 'completed', lastUpdated: new Date() } },
        { new: true }
      );
    }
  };

  // Handle free-form input that might require AI response
  const handleFreeFormInput = async (message) => {
    const user = userStates[socket.id];
    if (!user) return;
    
    await addMessageToChat("user", message);
    
    // Always use AI for free-form input
    user.needsAIResponse = true;
    const aiResponse = await generateAIResponse(message, user);
    
    if (aiResponse) {
      await sendChunks(socket, aiResponse);
      await addMessageToChat("bot", aiResponse);
    } else {
      // Fallback response if AI fails
      await sendChunks(socket, "I'm not sure how to respond to that. Could you please rephrase or let me know what specific service you're interested in?");
      await addMessageToChat("bot", "I'm not sure how to respond to that. Could you please rephrase or let me know what specific service you're interested in?");
    }
  };

  // Socket event handlers
  socket.on("user_message", async ({ message }) => {
    // console.log(`Message from ${socket.id}:`, message);
    
    const user = userStates[socket.id];
    
    // If we're in a specific step of the flow, handle normally
    if (user && user.currentStep) {
      await handleUserResponse(message);
    } else {
      // If we're not in a specific step, handle as free-form input
      await handleFreeFormInput(message);
    }
  });

  socket.on("option_selected", async (option) => {
    console.log(`Option selected by ${socket.id}:`, option);
    await handleUserResponse(option);
  });

  // Handle date selection for booking
  socket.on("date_selected", async (date) => {
    console.log(`Date selected by ${socket.id}:`, date);
    await handleUserResponse(date);
  });
  
  // Handle time selection for booking
  socket.on("time_selected", async (time) => {
    console.log(`Time selected by ${socket.id}:`, time);
    await handleUserResponse(time);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Update chat status to abandoned if not completed
    Chat.findOneAndUpdate(
      { chatId: socket.chatId, status: { $ne: 'completed' } },
      { $set: { status: 'abandoned', lastUpdated: new Date() } },
      { new: true }
    ).catch(err => console.error("Error updating chat status on disconnect:", err));

    delete userStates[socket.id];
  });

  socket.on("start_chat", async (data) => {
    console.log("Start chat:", data);
    
    // Send website info
    socket.emit("website_info", {
      title: websiteData.titleShowAtChatBot || websiteData.website_name,
      logo: websiteData.logo || null,
      description: websiteData.info?.description || null,
      timings: websiteData.info?.timings || null
    });

    // Format welcome message with proper greeting based on time of day
    const hour = new Date().getHours();
    let greeting = "Welcome";
    if (hour < 12) greeting = "Good morning! Welcome";
    else if (hour < 18) greeting = "Good afternoon! Welcome";
    else greeting = "Good evening! Welcome";
    
    const welcomeMessage = botConfig.welcomeMessage || `${greeting} to ${websiteData.website_name}! How can we assist you with your digital marketing needs today?`;
    await sendChunks(socket, welcomeMessage);
    await addMessageToChat("bot", welcomeMessage);

    // Initialize with first step
    const startStep = findStartStep();
    if (startStep) {
      userStates[socket.id].currentStep = startStep;
      await sendChunks(socket, startStep.question);
      await addMessageToChat("bot", startStep.question);

      // If dropdown, send options
      if (startStep.type === "dropdown") {
        socket.emit("show_options", startStep.options);
      }
    }
  });

  // Process end of conversation
  socket.on("end_conversation", async () => {
    const user = userStates[socket.id];
    if (!user) return;

    await addMessageToChat("user", "Conversation ended by user");

    // Update chat status to completed
    await Chat.findOneAndUpdate(
      { chatId: socket.chatId },
      { $set: { status: 'completed', lastUpdated: new Date() } },
      { new: true }
    );

    // Send end message
    await sendChunks(socket, botConfig.endMessage || "Thank you for chatting with us! Feel free to reach out anytime you need assistance with your digital marketing.");
    await addMessageToChat("bot", botConfig.endMessage || "Thank you for chatting with us! Feel free to reach out anytime you need assistance with your digital marketing.");

    delete userStates[socket.id];
  });
};