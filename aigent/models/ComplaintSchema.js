const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
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
  description: {
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
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  
  resolution: {
    type: String,
    default: null
  }

},{timestamps: true});

// Add index for faster queries
ComplaintSchema.index({ complaintId: 1 });
ComplaintSchema.index({ metaCode: 1 });
ComplaintSchema.index({ phone: 1 });
ComplaintSchema.index({ status: 1 });


// Update the updatedAt timestamp before saving
ComplaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for time since creation
ComplaintSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const createdDate = this.createdAt;
  const diffTime = Math.abs(now - createdDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `${diffDays} day(s) ago`;
  }
  
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  if (diffHours > 0) {
    return `${diffHours} hour(s) ago`;
  }
  
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  return `${diffMinutes} minute(s) ago`;
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
