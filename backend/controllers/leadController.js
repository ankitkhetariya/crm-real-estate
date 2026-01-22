const Lead = require('../models/Lead');
const Task = require('../models/Task'); 

// 1. Create Lead
exports.createLead = async (req, res) => {
    try {
        const { name, email, phone, company, source, status, budget, notes } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const newLead = new Lead({
            name,
            email,
            phone,
            company,
            source,
            status,
            budget,
            notes,
            assignedTo: req.user._id || req.user.userId
        });

        const savedLead = await newLead.save();
        res.status(201).json(savedLead);

    } catch (error) {
        console.error("Error creating lead:", error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Get All Leads
exports.getAllLeads = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        const leads = await Lead.find({ assignedTo: userId }).sort({ createdAt: -1 });
        res.status(200).json(leads);
    } catch (error) {
        console.error("Error fetching leads:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Get Single Lead
exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        
        if (lead.assignedTo.toString() !== (req.user._id || req.user.userId).toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. Update Lead
exports.updateLead = async (req, res) => {
    try {
        let lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (lead.assignedTo.toString() !== (req.user._id || req.user.userId).toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 5. Delete Lead
exports.deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (lead.assignedTo.toString() !== (req.user._id || req.user.userId).toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
 
        await lead.deleteOne();
        res.status(200).json({ message: 'Lead removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 📊 6. Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;

        const totalLeads = await Lead.countDocuments({ assignedTo: userId });
        const convertedLeads = await Lead.countDocuments({ assignedTo: userId, status: "Converted" });
        
        const revenueData = await Lead.aggregate([
            { $match: { assignedTo: userId, status: "Converted" } }, 
            { $group: { _id: null, totalRevenue: { $sum: "$budget" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        const pipelineData = await Lead.aggregate([
            { $match: { assignedTo: userId, status: { $ne: "Converted" } } }, 
            { $group: { _id: null, totalPipeline: { $sum: "$budget" } } }
        ]);
        const totalPipeline = pipelineData.length > 0 ? pipelineData[0].totalPipeline : 0;

        const conversionRate = totalLeads > 0 
            ? ((convertedLeads / totalLeads) * 100).toFixed(1)
            : 0;

        const statusCounts = await Lead.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const activeTasksCount = await Task.countDocuments({ 
            assignedTo: userId, 
            status: { $ne: "completed" } 
        });

        res.status(200).json({
            totalLeads,
            convertedLeads,
            totalRevenue,
            totalPipeline,
            conversionRate,
            statusCounts,
            activeTasksCount
        });

    } catch (error) {
        console.error("Stats Error:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 🗑️ 7. DELETE ALL LEADS (New Function)
exports.deleteAllLeads = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        
        // Sirf login user ka data delete hoga
        await Lead.deleteMany({ assignedTo: userId });

        res.status(200).json({ message: "All leads deleted successfully" });
    } catch (error) {
        console.error("Delete All Error:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};