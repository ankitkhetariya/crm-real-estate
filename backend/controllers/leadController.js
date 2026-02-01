const Lead = require('../models/Lead');
const User = require('../models/User');

// ✅ 1. Stats logic (UPDATED FOR MANAGER HIERARCHY & PIPELINE)
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const role = req.user.role;
        let query = {};

        // --- HIERARCHY LOGIC ---
        if (role === 'admin') {
            query = {}; // Admin sees everything
        } else if (role === 'manager') {
            // Find all agents managed by this manager
            const teamAgents = await User.find({ managedBy: userId }).distinct('_id');
            // Manager sees their own leads + their team's leads
            query = { assignedTo: { $in: [userId, ...teamAgents] } };
        } else {
            query = { assignedTo: userId }; // Agent sees only theirs
        }

        const [totalLeads, aggregation] = await Promise.all([
            Lead.countDocuments(query),
            Lead.aggregate([
                { $match: query },
                { 
                    $group: { 
                        _id: "$status", 
                        count: { $sum: 1 },
                        // ✅ Revenue: Sum budget only if status is "Converted"
                        revenue: { 
                            $sum: { 
                                $cond: [{ $eq: ["$status", "Converted"] }, { $toDouble: { $ifNull: ["$budget", 0] } }, 0] 
                            } 
                        },
                        // ✅ Pipeline: Sum budget for all other active statuses
                        pipeline: { 
                            $sum: { 
                                $cond: [{ $ne: ["$status", "Converted"] }, { $toDouble: { $ifNull: ["$budget", 0] } }, 0] 
                            } 
                        }
                    } 
                }
            ])
        ]);

        // Extract totals from the aggregation array
        const totalRevenue = aggregation.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
        const totalPipeline = aggregation.reduce((acc, curr) => acc + (curr.pipeline || 0), 0);
        const convertedCount = aggregation.find(a => a._id === "Converted")?.count || 0;
        
        const conversionRate = totalLeads > 0 
            ? ((convertedCount / totalLeads) * 100).toFixed(1) 
            : 0;

        res.status(200).json({ 
            totalLeads, 
            totalRevenue,
            totalPipeline,
            conversionRate: Number(conversionRate),
            statusCounts: aggregation,
            activeTasksCount: 0 // Placeholder
        });
    } catch (error) { 
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Error' }); 
    }
};

// ✅ 2. Get All (UPDATED FOR MANAGER HIERARCHY)
exports.getAllLeads = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const role = req.user.role;
        let query = {};

        if (role === 'admin') {
            query = {};
        } else if (role === 'manager') {
            const teamAgents = await User.find({ managedBy: userId }).distinct('_id');
            query = { assignedTo: { $in: [userId, ...teamAgents] } };
        } else {
            query = { assignedTo: userId };
        }

        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .lean();
            
        res.status(200).json(leads);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ✅ 3. Create
exports.createLead = async (req, res) => {
    try {
        const newLead = new Lead({ ...req.body, assignedTo: req.user.id });
        await newLead.save();
        res.status(201).json(newLead);
    } catch (error) { res.status(500).json({ message: 'Error creating lead' }); }
};

// ✅ 4. Get By ID
exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        res.status(200).json(lead);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ✅ 5. Update
exports.updateLead = async (req, res) => {
    try {
        const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ✅ 6. Delete
exports.deleteLead = async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ✅ 7. Delete All
exports.deleteAllLeads = async (req, res) => {
    try {
        await Lead.deleteMany({ assignedTo: req.user.id });
        res.status(200).json({ message: 'All deleted' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};