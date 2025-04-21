const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema({
  website_name: {
    type: String,
    required: true,
    trim: true
  },
  website_id: {
    type: String,
    required: true,
    unique: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'

  },
  joinedData: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  metaCode: {
    type: String,
    default: ''
  },
  info: {
    description: {
      type: String,
      default: ''
    },
    contactNumber: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    timings: {
      open: { type: String, default: '' },
      close: { type: String, default: '' }
    },
    social_links: {
      insta: {
        type: String,
        default: ''
      },
      fb: {
        type: String,
        default: ''
      },
      youtube: {
        type: String,
        default: ''
      }
    }
  },
  metaCodeVerify: {
    type: Boolean,
    default: false
  },
  titleShowAtChatBot: {
    type: String,
    default: ''
  },
  isChatBotCompleted: {
    type: Boolean,
    default: false
  },
  isChatBotActive: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Website', WebsiteSchema);
