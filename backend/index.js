const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Routes Import
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes'); 
const propertyRoutes = require('./routes/propertyRoutes');
const taskRoutes = require('./routes/taskRoutes'); // ✅ FIX: Uncomment kiya (Ye zaroori hai)

dotenv.config();
const app = express(); 

// ✅ Middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://crm-mohitrealestate.netlify.app"], 
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
app.use('/api/tasks', taskRoutes); // Ab ye line bina error ke chalegi

// Database Connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
