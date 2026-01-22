const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    relatedProperty: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);