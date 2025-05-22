const BookingSchema = require('../models/Booking.Schema');
const ChatSchema = require('../models/Chat.Schema');
const ServiceSchema = require('../models/Services.Schema');
const moment = require('moment-timezone');
exports.get_my_booking = async (req, res) => {
  try {
    const { metacode, page = 1, limit = 10, search = "" } = req.query;

    if (!metacode) {
      return res.status(400).json({ message: "Meta code is required" });
    }


    const filter = {
      metaCode: metacode,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { selectedCategory: { $regex: search, $options: 'i' } },
        { selectedService: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BookingSchema.countDocuments(filter);
    const bookings = await BookingSchema.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings fetched successfully",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      bookings
    });

  } catch (error) {
    console.error("Error in get_my_booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.get_dashboard_data = async (req, res) => {
  try {
    const metaCode = req.query.metaCode;
    if (!metaCode) return res.status(400).json({ message: "metaCode is required" });

    const metaCodeFilter = { metaCode };

    // 📆 Time Configs (IST)
    const nowIST = moment().tz('Asia/Kolkata');
    const todayStartIST = nowIST.clone().startOf('day');
    const sevenDaysAgoIST = todayStartIST.clone().subtract(6, 'days');

    const startDate = sevenDaysAgoIST.toDate();
    const endDate = nowIST.toDate();

    // 1️⃣ Recent Chats
    const recentChats = await ChatSchema.find({
      ...metaCodeFilter,
      chatStartAt: { $gte: startDate, $lte: endDate },
    });

    const totalChats = recentChats.length;
    const chatsWithDetails = recentChats.filter(chat => chat.name && chat.contact);
    const totalChatsWithDetails = chatsWithDetails.length;

    // 2️⃣ Recent Bookings
    const recentBookings = await BookingSchema.find({
      ...metaCodeFilter,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalBookings = recentBookings.length;
    const bookingsCompletedByAdmin = recentBookings.filter(b => b.status === 'completed_by_admin').length;

    // 3️⃣ Active chats without bookings
    const activeChats = recentChats.filter(chat => chat.status === 'active');
    const activeMetaCodes = activeChats.map(chat => chat.metaCode);
    const bookingMetaCodes = recentBookings.map(book => book.metaCode);
    const newActiveUsers = activeMetaCodes.filter(code => !bookingMetaCodes.includes(code)).length;

    // 4️⃣ Conversion rates
    const chatConversionRate = totalChats > 0 ? ((totalChatsWithDetails / totalChats) * 100).toFixed(2) : '0.00';
    const bookingConversionRate = totalChatsWithDetails > 0 ? ((totalBookings / totalChatsWithDetails) * 100).toFixed(2) : '0.00';

    // 5️⃣ Average Chat Time
    const totalSeconds = recentChats.reduce((acc, chat) => {
      const start = new Date(chat.chatStartAt).getTime();
      const end = new Date(chat.lastUpdated).getTime();
      return acc + ((end - start) / 1000); // seconds
    }, 0);
    const avgChatTime = totalChats ? totalSeconds / totalChats : 0;

    // 6️⃣ Unique Users (All Time)
    const allChats = await ChatSchema.find(metaCodeFilter);
    const allBookings = await BookingSchema.find(metaCodeFilter);

    const chatUsers = new Set();
    const bookingUsers = new Set();

    allChats.forEach(chat => {
      if (chat.name && chat.contact) {
        chatUsers.add(`${chat.name}-${chat.contact}`);
      }
    });

    allBookings.forEach(booking => {
      if (booking.name && booking.phone) {
        bookingUsers.add(`${booking.name}-${booking.phone}`);
      }
    });

    // 7️⃣ Next 7-Day Bookings (based on serviceDate)
    const futureBookingMap = {};

    const today = todayStartIST.clone();
    const sevenDaysLater = today.clone().add(7, 'days');

    allBookings.forEach(booking => {
      const serviceDateStr = booking.serviceDate;
      const parsedDate = moment(serviceDateStr, "dddd, MMMM D, YYYY").startOf('day');

      if (parsedDate.isValid() && parsedDate.isBetween(today, sevenDaysLater, null, '[]')) {
        const key = parsedDate.format('YYYY-MM-DD');
        futureBookingMap[key] = (futureBookingMap[key] || 0) + 1;
      }
    });

    const upcomingBookings = Object.entries(futureBookingMap).map(([date, count]) => ({
      date,
      totalBookings: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 🔚 Final Response
    return res.status(200).json({
      totalChatsIn7Days: totalChats,
      chatsWithNameAndContact: totalChatsWithDetails,
      chatConversionRate: `${chatConversionRate}%`,
      bookingsIn7Days: totalBookings,
      bookingConversionRate: `${bookingConversionRate}%`,
      bookingsCompletedByAdmin,
      newActiveUsers,
      averageChatTime: `${Math.round(avgChatTime)} seconds`,
      totalUniqueChatUsers: chatUsers.size,
      totalUniqueBookingUsers: bookingUsers.size,
      upcomingBookings
    });

  } catch (error) {
    console.error("Error in get_dashboard_data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const checkBookingStatus = (booking, allowedStatuses) => {
  if (!booking) return { status: 404, message: "Booking not found" };
  if (!allowedStatuses.includes(booking.status)) {
    return { status: 400, message: `Booking cannot be processed because it's already ${booking.status}` };
  }
  return null;
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    if (!bookingId) return res.status(400).json({ message: "Please provide a booking ID." });

    const booking = await BookingSchema.findById(bookingId);
    const statusCheck = checkBookingStatus(booking, ['pending', 'cancelled']);
    if (statusCheck) return res.status(statusCheck.status).json({ message: statusCheck.message });

    await BookingSchema.findByIdAndDelete(bookingId);
    return res.status(200).json({ message: "Booking deleted successfully." });
  } catch (error) {
    console.error("Error in deleteBooking:", error);
    return res.status(500).json({ message: "Something went wrong while trying to delete the booking. Please try again." });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    if (!bookingId) return res.status(400).json({ message: "Booking ID is required to confirm the booking." });

    const booking = await BookingSchema.findById(bookingId);
    const statusCheck = checkBookingStatus(booking, ['pending']);
    if (statusCheck) return res.status(statusCheck.status).json({ message: statusCheck.message });

    booking.status = "confirmed";
    await booking.save();
    return res.status(200).json({ success: true, message: "Booking successfully confirmed!" });
  } catch (error) {
    console.error("Error in confirmBooking:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while confirming the booking. Please try again." });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { cancelReason } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required to cancel the booking." });
    }

    const booking = await BookingSchema.findById(bookingId);
    const statusCheck = checkBookingStatus(booking, ['pending', 'confirmed']);
    if (statusCheck) {
      return res.status(statusCheck.status).json({ success: false, message: statusCheck.message });
    }

    booking.status = "cancelled";
    booking.cancelReason = cancelReason || "No reason provided";
    await booking.save();

    return res.status(200).json({ success: true, message: "Booking successfully cancelled." });
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while cancelling the booking. Please try again." });
  }
};


exports.updateBookingDetails = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { name, phone, address, serviceDate } = req.body;



    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required to update the details." });
    }

    const booking = await BookingSchema.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }


    const statusCheck = checkBookingStatus(booking, ['pending']);
    if (statusCheck) {
      return res.status(statusCheck.status).json({ message: statusCheck.message });
    }

    // Update basic booking details
    booking.name = name;
    booking.phone = phone;
    booking.address = address;

    // Check and update serviceDate if provided
    if (serviceDate) {
      const checkService = await ServiceSchema.findOne({
        name: booking.selectedCategory
      });

      if (!checkService) {
        return res.status(404).json({ message: "Selected service not found." });
      }

      const bookingLimit = checkService.howManyBookingsAllowed;

      if (!bookingLimit) {
        return res.status(400).json({ message: "Booking limit not set for this service." });
      }

      // 👇 Exclude current booking ID to avoid counting itself
      const existingBookings = await BookingSchema.countDocuments({
        _id: { $ne: booking._id },
        selectedService: booking.selectedService,
        serviceDate: serviceDate,
        status: { $ne: 'cancelled' }
      });


      if (existingBookings >= bookingLimit) {
        return res.status(400).json({
          message: `Service is fully booked on ${serviceDate}. Please choose another date.`
        });
      }

      booking.serviceDate = serviceDate;
    }

    await booking.save();

    return res.status(200).json({ message: "Booking details updated successfully." });

  } catch (error) {
    console.error("Error in updateBookingDetails:", error);
    return res.status(500).json({ message: "Something went wrong while updating the booking details. Please try again." });
  }
};

const getUniqueKey = (name, contact) => `${name?.toLowerCase()?.trim()}_${contact?.trim()}`;

exports.getUniqueCustomersByMetaCode = async (req, res) => {
  try {
    const { metaCode } = req.params;
    console.log(metaCode, "metaCode")

    const metaCodeFilter = metaCode ? { metaCode } : {};


    const allChats = await ChatSchema.find(metaCodeFilter);
    const allBookings = await BookingSchema.find(metaCodeFilter);


    const bookedUsersMap = new Map();
    const chatUsersMap = new Map();


    allBookings.forEach(booking => {
      const key = getUniqueKey(booking.name, booking.phone);
      if (booking.name && booking.phone && !bookedUsersMap.has(key)) {
        bookedUsersMap.set(key, {
          name: booking.name,
          phone: booking.phone,
          source: 'booking',
          metaCode: booking.metaCode,
          serviceDate: booking.serviceDate,
        });
      }
    });


    allChats.forEach(chat => {
      const key = getUniqueKey(chat.name, chat.contact);
      if (chat.name && chat.contact && !chatUsersMap.has(key)) {
        chatUsersMap.set(key, {
          name: chat.name,
          phone: chat.contact,
          source: 'chat',
          metaCode: chat.metaCode,
          serviceDate: chat.serviceDate,
        });
      }
    });


    const allBookedUsers = Array.from(bookedUsersMap.values());
    const allChatUsers = Array.from(chatUsersMap.values());


    const bookedUserKeys = new Set(bookedUsersMap.keys());
    const chatOnlyUsers = Array.from(chatUsersMap.entries())
      .filter(([key]) => !bookedUserKeys.has(key))
      .map(([, value]) => value);

    return res.status(200).json({
      totalChatUsers: allChatUsers.length,
      totalBookedUsers: allBookedUsers.length,
      chatOnlyUsers: chatOnlyUsers,
      bookedUsers: allBookedUsers,
    });

  } catch (error) {
    console.error("Error in getUniqueCustomersByMetaCode:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};