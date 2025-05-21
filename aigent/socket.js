const ServicesSchema = require("./models/Services.Schema");
const User = require("./models/User");
const WebsiteSchema = require("./models/Website.Schema");
const Chat = require("./models/Chat.Schema");
const Booking = require("./models/Booking.Schema");
const Complaint = require("./models/ComplaintSchema");
const { SendWhatsapp } = require("./utils/Whatsapp");

const userStates = {};

// Dynamic messages based on website data
const getMessages = (websiteData) => ({
    welcome: `Hi there! Welcome to ${websiteData.titleShowAtChatBot || websiteData.website_name}. I'm your virtual assistant and I'll help you. Could you please share your name?`,
    nameResponse: (name) => `Great to meet you, ${name}! Please share your 10-digit phone number.`,
    invalidPhone: "The phone number seems invalid. Please enter a valid 10-digit phone number.",
    purposeQuestion: (name) => `Thanks, ${name}! Would you like to make a booking or file a complaint? Please type "booking" or "complaint".`,
    invalidPurpose: "I didn't understand your choice. Please type either 'booking' or 'complaint'.",
    phoneResponse: (name) => `Thanks, ${name}! How can we assist you today? Here are our service categories.`,
    helpResponse: "Please choose a service category from the options below:",
    categoryResponse: (category) => `You've selected ${category}. Now choose a specific service from the list below:`,
    serviceResponse: (service, category) => `You chose ${service} in ${category}. Please enter the full address where service is needed.`,
    invalidAddress: "The address seems incomplete. Please provide more details so our team can locate you.",
    addressResponse: (address) => `Thanks for the address: "${address}". Please select your preferred service date.`,
    dateNotAvailable: (date, service) => `We're sorry, but all slots for ${service} on ${date} have been booked. Please select another date.`,
    complaintCategoryResponse: (category) => `You've selected ${category} for your complaint. Now choose a specific service from the list below:`,
    complaintServiceResponse: (service, category) => `You chose ${service} in ${category}. Please provide details about your complaint (minimum 20 characters):`,
    invalidComplaintDescription: "Please provide more details about your complaint (at least 20 characters) so we can assist you better.",
    complaintConfirmation: (details) => `
    Your complaint has been registered:

    • Name: ${details.name}
    • Phone: ${details.phone}
    • Category: ${details.selectedCategory}
    • Service: ${details.selectedService}
    • Complaint: ${details.complaintDescription}
    • Complaint ID: ${details.complaintId}

    Our team will contact you shortly to address your concern.
  `,
    bookingConfirmation: (details) => `
    Perfect! Your booking is confirmed:

    • Name: ${details.name}
    • Phone: ${details.phone}
    • Category: ${details.selectedCategory}
    • Service: ${details.selectedService}
    • Address: ${details.address}
    • Date: ${details.serviceDate}

    Click "Complete Booking" to receive our contact details.
  `,
    thankYou: (name, service, category, date) => `
    Thank you, ${name}, for choosing ${websiteData.titleShowAtChatBot || websiteData.website_name}!

    Your booking for ${service} in ${category} on ${date} has been registered. Our team will confirm shortly.
  `,
    thankYouComplaint: (name, complaintId) => `
    Thank you, ${name}, for bringing this matter to our attention!

    Your complaint (ID: ${complaintId}) has been registered. Our team will review and contact you soon.
    
    We appreciate your patience.
  `,
});

const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ''));
const validateAddress = (address) => address && address.trim().length >= 10;
const validateComplaintDescription = (description) => description && description.trim().length >= 20;
const generateComplaintId = () => {
    return 'COMP-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};


const generateBooking = () => {
    return 'BOOK-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};
exports.handleSocket = async (socket, metaCode) => {
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

    // Fetch services related to this metaCode
    let servicesList;
    try {
        servicesList = await ServicesSchema.find({ metaCode });
    } catch (err) {
        console.error("Error fetching services data:", err);
        servicesList = [];
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

    const messages = getMessages(websiteData);

    const sendChunks = async (socket, message) => {
        const words = message.split(" ");
        for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? " " : "");
            socket.emit("ai_reply", { chunk });
            await new Promise((res) => setTimeout(res, 80));
        }
        socket.emit("ai_complete");
    };

    // Add message to the existing chat document
    const addMessageToChat = async (sender, message) => {
        try {
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
        } catch (err) {
            console.error("Error adding message to chat:", err);
        }
    };

    // Update user information in the chat document
    const updateChatUserInfo = async (userData) => {
        try {
            const updateFields = {};

            if (userData.name) updateFields.name = userData.name;
            if (userData.phone) updateFields.contact = userData.phone;
            if (userData.userPurpose) updateFields.userPurpose = userData.userPurpose;
            if (userData.selectedCategory) updateFields.categorySelected = userData.selectedCategory;
            if (userData.selectedService) updateFields.subCategorySelected = userData.selectedService;
            if (userData.address) updateFields.address = userData.address;
            if (userData.serviceDate) updateFields.serviceDate = userData.serviceDate;
            if (userData.complaintDescription) updateFields.complaintDescription = userData.complaintDescription;
            if (userData.complaintId) updateFields.complaintId = userData.complaintId;

            if (Object.keys(updateFields).length > 0) {
                updateFields.lastUpdated = new Date();

                await Chat.findOneAndUpdate(
                    { chatId: socket.chatId },
                    { $set: updateFields },
                    { new: true }
                );
            }
        } catch (err) {
            console.error("Error updating chat user info:", err);
        }
    };

    // Check if the service has available slots for the given date
    const checkBookingAvailability = async (serviceId, date) => {
        try {
            const service = await ServicesSchema.findById(serviceId);

            if (!service || !service.bookingAllowed) {
                return { available: false, message: "This service is not available for booking." };
            }

            const bookingsCount = await Booking.countDocuments({
                selectedCategory: service.name,
                serviceDate: date,
                metaCode: metaCode,
                status: { $ne: 'cancelled' } // Don't count cancelled bookings
            });
            console.log("bookingsCount:", bookingsCount);

            // Check if booking limit has been reached
            if (bookingsCount >= service.howManyBookingsAllowed) {
                return {
                    available: false,
                    message: `All slots for this service on ${date} have been booked (${bookingsCount}/${service.howManyBookingsAllowed}). Please select another date.`
                };
            }

            return {
                available: true,
                slotsRemaining: service.howManyBookingsAllowed - bookingsCount
            };
        } catch (err) {
            console.error("Error checking booking availability:", err);
            return { available: false, message: "Error checking availability. Please try again." };
        }
    };

    // Send welcome message
    await sendChunks(socket, messages.welcome);
    await addMessageToChat("bot", messages.welcome);

    socket.on("user_message", async ({ message }) => {
        console.log(`Message from ${socket.id}:`, message);

        if (!userStates[socket.id]) {
            userStates[socket.id] = {
                step: 0,
                name: "",
                phone: "",
                userPurpose: "", // "booking" or "complaint"
                selectedCategory: "",
                selectedService: "",
                selectedServiceId: "",
                address: "",
                serviceDate: "",
                complaintDescription: "",
                complaintId: "",
                metaCode: metaCode,
            };
        }

        const user = userStates[socket.id];
        await addMessageToChat("user", message);

        try {
            switch (user.step) {
                case 0:
                    user.name = message;
                    await updateChatUserInfo({ name: user.name });
                    await sendChunks(socket, messages.nameResponse(user.name));
                    await addMessageToChat("bot", messages.nameResponse(user.name));
                    user.step = 1;
                    break;

                case 1:
                    const cleanPhone = message.replace(/[^0-9]/g, '');
                    if (!validatePhoneNumber(cleanPhone)) {
                        await sendChunks(socket, messages.invalidPhone);
                        await addMessageToChat("bot", messages.invalidPhone);
                        break;
                    }
                    user.phone = cleanPhone;
                    await updateChatUserInfo({ phone: user.phone });

                    // Ask if the user wants to make a booking or file a complaint
                    await sendChunks(socket, messages.purposeQuestion(user.name));
                    await addMessageToChat("bot", messages.purposeQuestion(user.name));
                    user.step = 1.5;
                    break;

                case 1.5:
                    // Process user purpose (booking or complaint)
                    const purpose = message.trim().toLowerCase();
                    if (purpose === "booking" || purpose.includes("book")) {
                        user.userPurpose = "booking";
                        await updateChatUserInfo({ userPurpose: "booking" });

                        // Continue with booking flow
                        await sendChunks(socket, messages.phoneResponse(user.name));
                        await addMessageToChat("bot", messages.phoneResponse(user.name));
                        user.step = 2;

                        // Filter and prepare service categories that have bookingAllowed=true
                        const availableServices = servicesList.filter(service => service.bookingAllowed);
                        const categories = availableServices.map(service => ({
                            category: service.name,
                            description: service.description
                        }));

                        socket.emit("_show_categories", categories);
                    }
                    else if (purpose === "complaint" || purpose.includes("complain")) {
                        user.userPurpose = "complaint";
                        await updateChatUserInfo({ userPurpose: "complaint" });

                        // Start complaint flow
                        await sendChunks(socket, "Please select the category related to your complaint:");
                        await addMessageToChat("bot", "Please select the category related to your complaint:");
                        user.step = 10; // Different step for complaint flow

                        // Show all service categories for complaints (not just bookable ones)
                        const allCategories = servicesList.map(service => ({
                            category: service.name,
                            description: service.description
                        }));

                        socket.emit("_show_categories", allCategories);
                    }
                    else {
                        await sendChunks(socket, messages.invalidPurpose);
                        await addMessageToChat("bot", messages.invalidPurpose);
                    }
                    break;

                case 2:
                    await sendChunks(socket, messages.helpResponse);
                    await addMessageToChat("bot", messages.helpResponse);

                    // Show categories again (only those with bookingAllowed=true)
                    const availableServicesRefresh = servicesList.filter(service => service.bookingAllowed);
                    const categoriesRefresh = availableServicesRefresh.map(service => ({
                        category: service.name,
                        description: service.description
                    }));

                    socket.emit("_show_categories", categoriesRefresh);
                    user.step = 3;
                    break;

                case 4:
                    if (!validateAddress(message)) {
                        await sendChunks(socket, messages.invalidAddress);
                        await addMessageToChat("bot", messages.invalidAddress);
                        break;
                    }

                    user.address = message;
                    await updateChatUserInfo({ address: user.address });
                    await sendChunks(socket, messages.addressResponse(user.address));
                    await addMessageToChat("bot", messages.addressResponse(user.address));
                    socket.emit("_show_date_picker");
                    user.step = 5;
                    break;

                case 5:
                    // Date selected - check if booking is available
                    user.serviceDate = message;

                    // Find the service document
                    const selectedService = await ServicesSchema.findOne({
                        metaCode: metaCode,
                        name: user.selectedCategory,
                        "subCategories.name": user.selectedService
                    });

                    if (!selectedService) {
                        await sendChunks(socket, "Sorry, this service is no longer available.");
                        await addMessageToChat("bot", "Sorry, this service is no longer available.");
                        break;
                    }

                    // Store service ID for later use
                    user.selectedServiceId = selectedService._id;

                    // Check availability
                    const availability = await checkBookingAvailability(selectedService._id, user.serviceDate);

                    if (!availability.available) {
                        await sendChunks(socket, messages.dateNotAvailable(user.serviceDate, user.selectedService));
                        await addMessageToChat("bot", messages.dateNotAvailable(user.serviceDate, user.selectedService));
                        socket.emit("_show_date_picker"); // Ask to select another date
                        break;
                    }

                    // Date is available, proceed with booking
                    await updateChatUserInfo({ serviceDate: user.serviceDate });
                    const confirmationMsg = messages.bookingConfirmation(user);
                    await sendChunks(socket, confirmationMsg);
                    await addMessageToChat("bot", confirmationMsg);
                    socket.emit("booking_done");
                    user.step = 6;
                    break;

                // Complaint flow - collect complaint description
                case 11:
                    // Validate the complaint description
                    if (!validateComplaintDescription(message)) {
                        await sendChunks(socket, messages.invalidComplaintDescription);
                        await addMessageToChat("bot", messages.invalidComplaintDescription);
                        break;
                    }

                    // Save the complaint description
                    user.complaintDescription = message;

                    // Generate a unique complaint ID
                    user.complaintId = generateComplaintId();

                    await updateChatUserInfo({
                        complaintDescription: user.complaintDescription,
                        complaintId: user.complaintId
                    });

                    try {
                        // Create a new complaint record
                        const newComplaint = new Complaint({
                            complaintId: user.complaintId,
                            name: user.name,
                            phone: user.phone,
                            selectedCategory: user.selectedCategory,
                            selectedService: user.selectedService,
                            description: user.complaintDescription,
                            metaCode: user.metaCode,
                            chatId: socket.chatId,
                            status: 'pending'
                        });

                        await newComplaint.save();

                        // Send SMS notification to the user
                        try {
                            await SendWhatsapp(
                                user.phone,
                                'compain_text',
                                [newComplaint.name, newComplaint.complaintId, new Date(newComplaint.createdAt).toDateString()]
                            );

                            console.log(`SMS notification sent to ${user.phone} for complaint ${user.complaintId}`);
                            await SendWhatsapp(
                                '9311539090',
                                'admin_new_complain',
                                [newComplaint.complaintId, newComplaint.name, newComplaint.phone, newComplaint?.selectedCategory, newComplaint?.selectedService, new Date(newComplaint.createdAt).toDateString(), newComplaint?.status]
                            )
                            console.log(`Admin SMS notification sent to ${user.phone} for complaint ${user.complaintId}`);
                        } catch (smsError) {
                            console.error("Failed to send SMS notification:", smsError);
                        }

                        // Show complaint confirmation
                        const complaintConfirmMsg = messages.complaintConfirmation(user);
                        await sendChunks(socket, complaintConfirmMsg);
                        await addMessageToChat("bot", complaintConfirmMsg);

                        // Update chat status
                        await Chat.findOneAndUpdate(
                            { chatId: socket.chatId },
                            { $set: { status: 'completed', lastUpdated: new Date() } },
                            { new: true }
                        );

                        // Thank you message
                        const thankYouMsg = messages.thankYouComplaint(user.name, user.complaintId);
                        await sendChunks(socket, thankYouMsg);
                        await addMessageToChat("bot", thankYouMsg);

                        // Provide contact information
                        socket.emit("blueace_contact_details", getContactDetails(websiteData, user.name));

                        user.step = 12; // Complete
                    } catch (saveError) {
                        console.error("Error saving complaint:", saveError);
                        await sendChunks(socket, "We encountered an error while saving your complaint. Please try again.");
                        await addMessageToChat("bot", "We encountered an error while saving your complaint. Please try again.");
                    }
                    break;

                default:
                    if (user.userPurpose === "complaint" && user.step >= 10) {
                        // For complaint flow
                        const continuationMsg = "I'm here to assist you with your complaint. Please provide details about your concern.";
                        await sendChunks(socket, continuationMsg);
                        await addMessageToChat("bot", continuationMsg);
                    } else {
                        // For booking flow
                        const continuationMsg = "I'm here to assist you with your booking. Let's continue where we left off.";
                        await sendChunks(socket, continuationMsg);
                        await addMessageToChat("bot", continuationMsg);
                    }
            }
        } catch (err) {
            console.error("Error:", err);
            const errorMsg = "Oops! Something went wrong. Please try again.";
            await sendChunks(socket, errorMsg);
            await addMessageToChat("bot", errorMsg);
        }
    });

    // Helper function to prepare contact details
    const getContactDetails = (websiteData, userName) => {
        return {
            message: `Thank you for reaching out to us, ${userName}! We're here to assist you further.`,
            contact_details: {
                address: websiteData.info?.address || "",
                phone_numbers: [websiteData.info?.contactNumber || ""],
                email: websiteData.info?.email || "info@" + websiteData.website_name + ".com",
                map_link: `https://www.google.com/maps?q=${encodeURIComponent(websiteData.info?.address || "")}`
            },
            button_options: [
                { label: "Call Us", type: "phone", number: websiteData.info?.contactNumber || "" },
                { label: "Email Us", type: "email", email: websiteData.info?.email || "info@" + websiteData.website_name + ".com" },
                { label: "View on Map", type: "map", link: `https://www.google.com/maps?q=${encodeURIComponent(websiteData.info?.address || "")}` },
            ],
            social_links: websiteData.social_links || {}
        };
    };

    socket.on("user_category_selected", async (category) => {
        const user = userStates[socket.id];
        await addMessageToChat("user", `Selected category: ${category}`);

        if (user) {
            user.selectedCategory = category;
            await updateChatUserInfo({ selectedCategory: category });

            if (user.userPurpose === "complaint") {
                // For complaint flow
                user.step = 10.5;

                // Find the selected service to get subcategories
                const foundService = servicesList.find(s => s.name === category);

                if (foundService) {
                    // Prepare subcategories for display
                    const subServices = foundService.subCategories.map(sub => sub.name);
                    socket.emit("_show_services", subServices);

                    const categoryResponseMsg = messages.complaintCategoryResponse(category);
                    await sendChunks(socket, categoryResponseMsg);
                    await addMessageToChat("bot", categoryResponseMsg);
                } else {
                    // Service not found, show error
                    await sendChunks(socket, "Sorry, this category is not available. Please select another category.");
                    await addMessageToChat("bot", "Sorry, this category is not available. Please select another category.");

                    // Show all categories again
                    const allCategories = servicesList.map(service => ({
                        category: service.name,
                        description: service.description
                    }));
                    socket.emit("_show_categories", allCategories);
                }
            } else {
                // For booking flow (original behavior)
                // Find the selected service to get subcategories
                const foundService = servicesList.find(s => s.name === category && s.bookingAllowed);

                if (foundService) {
                    user.step = 3.5;

                    // Prepare subcategories for display
                    const subServices = foundService.subCategories.map(sub => sub.name);
                    socket.emit("_show_services", subServices);

                    const categoryResponseMsg = messages.categoryResponse(category);
                    await sendChunks(socket, categoryResponseMsg);
                    await addMessageToChat("bot", categoryResponseMsg);
                } else {
                    // Service not found or not bookable, show error
                    await sendChunks(socket, "Sorry, this service is not available for booking. Please select another category.");
                    await addMessageToChat("bot", "Sorry, this service is not available for booking. Please select another category.");

                    // Show bookable categories again
                    const availableServicesRefresh = servicesList.filter(service => service.bookingAllowed);
                    const categoriesRefresh = availableServicesRefresh.map(service => ({
                        category: service.name,
                        description: service.description
                    }));
                    socket.emit("_show_categories", categoriesRefresh);
                }
            }
        }
    });

    socket.on("user_service_selected", async (service) => {
        const user = userStates[socket.id];
        await addMessageToChat("user", `Selected service: ${service}`);

        if (user) {
            user.selectedService = service;
            await updateChatUserInfo({ selectedService: service });

            if (user.userPurpose === "complaint" && user.step === 10.5) {
                // For complaint flow
                const serviceResponseMsg = messages.complaintServiceResponse(service, user.selectedCategory);
                await sendChunks(socket, serviceResponseMsg);
                await addMessageToChat("bot", serviceResponseMsg);
                user.step = 11; // Move to collect complaint description
            } else if (user.step === 3.5) {
                // For booking flow (original behavior)
                const serviceResponseMsg = messages.serviceResponse(service, user.selectedCategory);
                await sendChunks(socket, serviceResponseMsg);
                await addMessageToChat("bot", serviceResponseMsg);
                user.step = 4; // Move to collect address
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        Chat.findOneAndUpdate(
            { chatId: socket.chatId, status: { $ne: 'completed' } },
            { $set: { status: 'abandoned', lastUpdated: new Date() } },
            { new: true }
        ).catch(err => console.error("Error updating chat status on disconnect:", err));

        delete userStates[socket.id];
    });

    socket.on("booking_completed", async () => {
        const user = userStates[socket.id];
        if (!user) return;

        await addMessageToChat("user", "Booking completed");

        // Update chat status to completed
        await Chat.findOneAndUpdate(
            { chatId: socket.chatId },
            { $set: { status: 'completed', lastUpdated: new Date() } },
            { new: true }
        );
        let bookingId = generateBooking();
        // Create a new booking record
        const newBooking = new Booking({
            name: user.name,
            phone: user.phone,
            Booking_id: bookingId,
            selectedCategory: user.selectedCategory,
            selectedService: user.selectedService,
            address: user.address,
            serviceDate: user.serviceDate,
            metaCode: user.metaCode,
            chatId: socket.chatId,
            status: 'pending'
        });

        await newBooking.save();

        try {
            await SendWhatsapp(
                newBooking.phone,
                'order_via_bot',
                [newBooking.name, newBooking.Booking_id, new Date(newBooking.serviceDate).toDateString(), newBooking?.selectedCategory, newBooking?.selectedService, newBooking?.status]

            );
            console.log(`SMS notification sent to ${user.phone} for booking`);
        } catch (smsError) {
            console.error("Failed to send SMS notification:", smsError);
        }

        // Provide contact information
        socket.emit("blueace_contact_details", getContactDetails(websiteData, user.name));
        const thankYouMsg = messages.thankYou(user.name, user.selectedService, user.selectedCategory, user.serviceDate);
        await sendChunks(socket, thankYouMsg);
        await addMessageToChat("bot", thankYouMsg);
    });

    socket.on("start_chat", async (data) => {
        console.log(data);
        socket.emit("website_info", {
            title: websiteData.titleShowAtChatBot || websiteData.website_name,
            logo: websiteData.logo || null,
            description: websiteData.info?.description || null,
            timings: websiteData.info?.timings || null
        });
    });
};