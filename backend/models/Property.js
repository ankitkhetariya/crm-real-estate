const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please add a property title'] 
    },
    description: String,
    type: { 
        type: String, 
        enum: ['Apartment', 'House', 'Commercial', 'Land'], // Capitalized for better UI display
        required: true 
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    
    // Property specific details
    bedrooms: Number,
    bathrooms: Number,
    area: Number, // Measured in square feet

    // Changed from array to single string to match frontend upload logic
    image: {
        type: String, 
        default: "" 
    },

    status: { 
        type: String, 
        enum: ['Available', 'Sold', 'Rented'], 
        default: 'Available' 
    },

    // Reference to the user who assigned or created this property
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },

    // Optional reference to a Lead if the property belongs to one
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lead' 
    }
}, { 
    timestamps: true // Automatically manages createdAt and updatedAt fields
});

module.exports = mongoose.model('Property', propertySchema);