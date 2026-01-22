const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  company: {
    type: String
  },
  source: {
    type: String,
    // ✅ FIX: "Social Media" aur "Ads" add kiye taaki Frontend se match kare
    enum: ['Website', 'LinkedIn', 'Referral', 'Cold Call', 'Social Media', 'Ads', 'Other'], 
    default: 'Website'
  },
  status: {
    type: String,
    // ✅ FIX: "Proposal Sent" add kiya (Yahi error de raha tha)
    enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Lost', 'Converted'], 
    default: 'New'
  },
  budget: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);