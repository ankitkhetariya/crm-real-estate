const User = require('../models/User');
const Lead = require('../models/Lead'); // 👈 Must import Lead to calculate revenue

exports.getMyAgents = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        // 1. Find agents assigned to this manager
        const agents = await User.find({ 
            managedBy: userId, 
            role: 'agent' 
        }).select('-password').lean();

        // 2. Calculate real-time performance for each agent
        const agentsWithPerformance = await Promise.all(agents.map(async (agent) => {
            const stats = await Lead.aggregate([
                { $match: { assignedTo: agent._id } },
                {
                    $group: {
                        _id: null,
                        totalLeads: { $sum: 1 },
                        revenue: { 
                            $sum: { 
                                $cond: [
                                    { $eq: ["$status", "Converted"] }, 
                                    { $toDouble: { $ifNull: ["$budget", 0] } }, 
                                    0
                                ] 
                            } 
                        }
                    }
                }
            ]);

            return {
                ...agent,
                totalLeads: stats[0]?.totalLeads || 0,
                revenue: stats[0]?.revenue || 0
            };
        }));

        // 3. Sort by revenue (descending) before sending to frontend
        agentsWithPerformance.sort((a, b) => b.revenue - a.revenue);
        
        res.status(200).json(agentsWithPerformance);
    } catch (error) {
        console.error("ManagerController Error:", error);
        res.status(500).json({ error: "Failed to fetch team analytics" });
    }
};