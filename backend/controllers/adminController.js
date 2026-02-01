const User = require('../models/User');
const Lead = require('../models/Lead');

// ✅ 1. Master Stats Fetch (Updated for Pipeline and Profit)
exports.getAdminMasterStats = async (req, res) => {
    try {
        const totalAgents = await User.countDocuments({ role: 'agent' });
        const totalManagers = await User.countDocuments({ role: 'manager' });
        
        // Updated Aggregation to get Revenue AND Pipeline in one call
        const financialAggregation = await Lead.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { 
                        $sum: { $cond: [{ $eq: ["$status", "Converted"] }, { $toDouble: { $ifNull: ["$budget", 0] } }, 0] } 
                    },
                    totalPipeline: { 
                        $sum: { $cond: [{ $ne: ["$status", "Converted"] }, { $toDouble: { $ifNull: ["$budget", 0] } }, 0] } 
                    }
                }
            }
        ]);

        const totalRevenue = financialAggregation[0]?.totalRevenue || 0;
        const totalPipeline = financialAggregation[0]?.totalPipeline || 0;
        // Business Logic: Profit is 20% of Revenue
        const totalProfit = totalRevenue * 0.2;

        const managers = await User.find({ role: 'manager' }).select('-password');
        
        const managerPerformance = await Promise.all(managers.map(async (mgr) => {
            const agentIds = await User.find({ managedBy: mgr._id }).distinct('_id');
            const teamStats = await Lead.aggregate([
                { $match: { assignedTo: { $in: [mgr._id, ...agentIds] } } },
                { 
                    $group: { 
                        _id: null, 
                        revenue: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, { $toDouble: { $ifNull: ["$budget", 0] } }, 0] } }
                    } 
                }
            ]);

            const teamRev = teamStats[0]?.revenue || 0;
            return { 
                managerName: mgr.name, 
                teamProfit: teamRev * 0.2 // Consistently showing 20% profit for the chart
            };
        }));

        const agents = await User.find({ role: 'agent' }).select('-password');
        
        // Map agents to include their calculated revenue for sorting
        const agentsWithRevenue = await Promise.all(agents.map(async (agent) => {
            const agentRev = await Lead.aggregate([
                { $match: { assignedTo: agent._id, status: "Converted" } },
                { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ["$budget", 0] } } } } }
            ]);
            return { ...agent.toObject(), revenue: agentRev[0]?.total || 0 };
        }));

        const topAgents = agentsWithRevenue.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        res.status(200).json({
            stats: { 
                totalRevenue, 
                totalPipeline, // Added for Dashboard
                totalProfit, 
                totalAgents, 
                totalManagers 
            },
            managerPerformance,
            topAgents,
            managersList: managers,
            agentsList: agents
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
};

// ✅ 2. Multi-Agent Assignment Logic (No changes to logic)
exports.assignTeam = async (req, res) => {
    try {
        const { managerId, agentIds } = req.body; 

        if (!managerId) {
            return res.status(400).json({ error: "Manager ID is required" });
        }

        await User.updateMany(
            { managedBy: managerId },
            { $set: { managedBy: null } }
        );

        if (agentIds && agentIds.length > 0) {
            await User.updateMany(
                { _id: { $in: agentIds } },
                { $set: { managedBy: managerId } }
            );
        }

        res.status(200).json({ 
            success: true,
            message: `${agentIds ? agentIds.length : 0} agents linked successfully.` 
        });

    } catch (err) {
        res.status(500).json({ error: "Bulk assignment failed" });
    }
};