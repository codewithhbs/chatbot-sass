const mongoose = require('mongoose');


const jsonDbSchema = new mongoose.Schema({
    feildName:{
        type: String,
        required: true
    },
    feildValue:{
        type: String,
        required: true
    },
    feildType:{
        type: String,
        required: true
    },
    isRequired:{
        type: Boolean,
        default: false
    },

})

const CutomFlowBookingSchema = new mongoose.Schema({
    metaCodeDb: {
        type: String,
        required: true
    },
    websiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        required: true
    },
    flowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BotFlow',
        required: true
    },
    json_db:[jsonDbSchema]

}, {
    timestamps: true,
    strict: false
});



module.exports = mongoose.model('CustomeFlowBooking', CutomFlowBookingSchema);