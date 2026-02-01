const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import Route Modules
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();

/**
 * CORS Configuration
 * 'origin' includes local development and production frontend URL
 */
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://crm-mohitrealestate.netlify.app"
    ],
    credentials: true
}));

/**
 * Body Parser Middleware
 * Parses incoming requests with JSON payloads
 */
app.use(express.json());

/**
 * API Route Definitions
 * Hierarchy and module-based route mounting
 */
app.use('/api/auth', authRoutes);         // Authentication (Login/Register)
app.use('/api/leads', leadRoutes);       // Lead Management & Stats
app.use('/api/properties', propertyRoutes); // Real Estate Inventory
app.use('/api/tasks', taskRoutes);       // Task Tracking
app.use('/api/admin', adminRoutes);       // Admin Master Control
app.use('/api/manager', managerRoutes);   // Manager Team Oversight

/**
 * Database Connection
 * Connecting to MongoDB Atlas using URL from environment variables
 */
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit process with failure
    });

/**
 * Health Check Route (Optional but recommended for live servers)
 */
app.get('/', (req, res) => {
    res.send('CRM Backend API is running...');
});

/**
 * Server Execution
 * Listen on defined PORT or default to 5000
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Production Server is running on port ${PORT}`);
});