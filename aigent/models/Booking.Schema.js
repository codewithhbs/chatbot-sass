const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    selectedCategory: {
        type: String,
        required: true
    },
    selectedService: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    serviceDate: {
        type: String,
        required: true
    },
    metaCode: {
        type: String,
        required: true
    },
    chatId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    cancelReason:{
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;