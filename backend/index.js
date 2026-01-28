const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Routes Import
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes'); 
const propertyRoutes = require('./routes/propertyRoutes');
const taskRoutes = require('./routes/taskRoutes'); 

dotenv.config();
const app = express(); 

// Middleware - Yahan logic wahi hai, bas live URL add kiya hai
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://crm-mohitrealestate.netlify.app" // Aapka live frontend address
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// ✅ Body Parser Limit (Images ke liye)
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Routes Connect Karein
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes); 
app.use('/api/properties', propertyRoutes);
app.use('/api/tasks', taskRoutes); 

// Database Connection - Name wahi rakha hai (MONGO_URL)
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// Render ke liye PORT setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});