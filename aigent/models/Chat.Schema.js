const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  contact: {
    type: String
  },
  categorySelected: {
    type: String
  },
  subCategorySelected: {
    type: String
  },
  address: {
    type: String
  },
  serviceDate: {
    type: String
  },
  chatStartAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  metaCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  messages: [messageSchema]
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;