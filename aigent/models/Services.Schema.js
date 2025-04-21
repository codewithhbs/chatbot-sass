const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    }
});

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    metaCode: {
        type: String, 
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subCategories: [SubCategorySchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Service', ServiceSchema);