const ServicesSchema = require("./models/Services.Schema");
const User = require("./models/User");
const WebsiteSchema = require("./models/Website.Schema");
const Chat = require("./models/Chat.Schema");
const Booking = require("./models/Booking.Schema");

const userStates = {};

// Dynamic messages based on website data
const getMessages = (websiteData) => ({
    welcome: `Hi there! Welcome to ${websiteData.titleShowAtChatBot || websiteData.website_name}. I'm your virtual assistant and I'll help you book our services. Could you please share your name?`,
    nameResponse: (name) => `Great to meet you, ${name}! Please share your 10-digit phone number.`,
    invalidPhone: "The phone number seems invalid. Please enter a valid 10-digit phone number.",
    phoneResponse: (name) => `Thanks, ${name}! How can we assist you today? Here are our service categories.`,
    helpResponse: "Please choose a service category from the options below:",
    categoryResponse: (category) => `You've selected ${category}. Now choose a specific service from the list below:`,
    serviceResponse: (service, category) => `You chose ${service} in ${category}. Please enter the full address where service is needed.`,
    invalidAddress: "The address seems incomplete. Please provide more details so our team can locate you.",
    addressResponse: (address) => `Thanks for the address: "${address}". Please select your preferred service date.`,
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
});

const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ''));
const validateAddress = (address) => address && address.trim().length >= 10;

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
        const updateFields = {};

        if (userData.name) updateFields.name = userData.name;
        if (userData.phone) updateFields.contact = userData.phone;
        if (userData.selectedCategory) updateFields.categorySelected = userData.selectedCategory;
        if (userData.selectedService) updateFields.subCategorySelected = userData.selectedService;
        if (userData.address) updateFields.address = userData.address;
        if (userData.serviceDate) updateFields.serviceDate = userData.serviceDate;

        if (Object.keys(updateFields).length > 0) {
            updateFields.lastUpdated = new Date();

            await Chat.findOneAndUpdate(
                { chatId: socket.chatId },
                { $set: updateFields },
                { new: true }
            );
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
                selectedCategory: "",
                selectedService: "",
                address: "",
                serviceDate: "",
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
                    await sendChunks(socket, messages.phoneResponse(user.name));
                    await addMessageToChat("bot", messages.phoneResponse(user.name));
                    user.step = 2;

                    // Prepare service categories for display
                    const categories = servicesList.map(service => ({
                        category: service.name,
                        description: service.description
                    }));

                    socket.emit("_show_categories", categories);
                    break;

                case 2:
                    await sendChunks(socket, messages.helpResponse);
                    await addMessageToChat("bot", messages.helpResponse);

                    // Show categories again
                    const categoriesRefresh = servicesList.map(service => ({
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
                    user.serviceDate = message;
                    await updateChatUserInfo({ serviceDate: user.serviceDate });
                    const confirmationMsg = messages.bookingConfirmation(user);
                    await sendChunks(socket, confirmationMsg);
                    await addMessageToChat("bot", confirmationMsg);
                    socket.emit("booking_done");
                    user.step = 6;
                    break;

                default:
                    const continuationMsg = "I'm here to assist you with your booking. Let's continue where we left off.";
                    await sendChunks(socket, continuationMsg);
                    await addMessageToChat("bot", continuationMsg);
            }
        } catch (err) {
            console.error("Error:", err);
            const errorMsg = "Oops! Something went wrong. Please try again.";
            await sendChunks(socket, errorMsg);
            await addMessageToChat("bot", errorMsg);
        }
    });

    socket.on("user_category_selected", async (category) => {
        const user = userStates[socket.id];
        await addMessageToChat("user", `Selected category: ${category}`);

        // Find the selected service to get subcategories
        const foundService = servicesList.find(s => s.name === category);

        if (user && foundService) {
            user.selectedCategory = category;
            await updateChatUserInfo({ selectedCategory: category });
            user.step = 3.5;

            // Prepare subcategories for display
            const subServices = foundService.subCategories.map(sub => sub.name);
            socket.emit("_show_services", subServices);

            const categoryResponseMsg = messages.categoryResponse(category);
            await sendChunks(socket, categoryResponseMsg);
            await addMessageToChat("bot", categoryResponseMsg);
        }
    });

    socket.on("user_service_selected", async (service) => {
        const user = userStates[socket.id];
        await addMessageToChat("user", `Selected service: ${service}`);

        if (user && user.step === 3.5) {
            user.selectedService = service;
            await updateChatUserInfo({ selectedService: service });
            const serviceResponseMsg = messages.serviceResponse(service, user.selectedCategory);
            await sendChunks(socket, serviceResponseMsg);
            await addMessageToChat("bot", serviceResponseMsg);
            user.step = 4;
        }
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

        // Create a new booking record
        const newBooking = new Booking({
            name: user.name,
            phone: user.phone,
            selectedCategory: user.selectedCategory,
            selectedService: user.selectedService,
            address: user.address,
            serviceDate: user.serviceDate,
            metaCode: user.metaCode,
            chatId: socket.chatId,
            status: 'pending'
        });

        await newBooking.save();

        // Use website data for contact information
        const contactDetails = {
            message: `Thank you for booking with us, ${user.name}! We're excited to assist you further.`,
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

        console.log(`Booking completed: ${user.name} (${user.phone}), ${user.selectedCategory} > ${user.selectedService} at ${user.address} on ${user.serviceDate}`);

        socket.emit("blueace_contact_details", contactDetails);
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