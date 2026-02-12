const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');

// Initialize environment variables
dotenv.config();

const app = express();

// Configure CORS for local development and production environments
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://crm-mohitrealestate.netlify.app"
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"] 
}));

// Body parser middleware with increased limit to prevent 413 Payload Too Large errors
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);

// Establish connection to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connection established'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

// Basic health check route
app.get('/', (req, res) => {
    res.send('CRM Backend API is operational');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});