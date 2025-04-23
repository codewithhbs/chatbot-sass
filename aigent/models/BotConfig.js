const mongoose = require('mongoose');
const { Schema } = mongoose;


const OptionConnectionSchema = new Schema({
  optionValue: {
    type: String,
    required: true
  },
  nextStepId: {
    type: String,
    default: null
  }
});

const StepSchema = new Schema({
  stepId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'time', 'dropdown', 'multiselect', 'address', 'phone', 'email', 'package'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  responseTemplate: {
    type: String,
    default: ""
  },
  validation: {
    required: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: "This field is required"
    }
  },
  options: [String], 
  optionConnections: [OptionConnectionSchema], 
  defaultNextStepId: {
    type: String,
    default: null
  },
  isStart: {
    type: Boolean,
    default: false
  },
  isEnd: {
    type: Boolean,
    default: false
  },

});

// Bot Flow Schema
const BotFlowSchema = new Schema({
  botId: {
    type: Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
    unique: true
   
  },
  metaCode: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: "New Chatbot Flow"
  },
  description: {
    type: String,
    default: ""
  },
  welcomeMessage: {
    type: String,
    default: "Welcome to our chatbot. How can I help you today?"
  },
  endMessage: {
    type: String,
    default: "Thank you for your time. Have a great day!"
  },
  steps: [StepSchema],
 
 
}, {
  timestamps: true
});

module.exports = mongoose.model('BotFlow', BotFlowSchema);