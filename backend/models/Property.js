const mongoose = require('mongoose');

// ✅ 1. Sub-schema banayein (Room Sizes ke liye)
const roomDetailSchema = new mongoose.Schema({
    size: { 
        type: String, 
        required: true,
        default: "Standard" 
    }
}, { _id: false }); // _id false rakhein taaki database bhare nahi

const propertySchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please add a property title'] 
    },
    description: String,
    type: { 
        type: String, 
        enum: ['Apartment', 'House', 'Commercial', 'Land'], 
        required: true 
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    
    // ✅ 2. Yahan Change Hai (Number hata kar Array lagayein)
    bedrooms: [roomDetailSchema], 
    bathrooms: [roomDetailSchema],
    
    area: Number, 

    image: {
        type: String, 
        default: "" 
    },

    status: { 
        type: String, 
        enum: ['Available', 'Sold', 'Rented'], 
        default: 'Available' 
    },

    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },

    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lead',
        default: null // Default null rakhein
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Property', propertySchema);