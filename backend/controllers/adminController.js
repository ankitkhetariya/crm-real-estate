const User = require("../models/User");
const Lead = require("../models/Lead");

// 1. Master Stats Fetch (Updated for Pipeline and Profit)
exports.getAdminMasterStats = async (req, res) => {
  try {
    const totalAgents = await User.countDocuments({ role: "agent" });
    const totalManagers = await User.countDocuments({ role: "manager" });

    // Updated Aggregation to get Revenue AND Pipeline in one call
    const financialAggregation = await Lead.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Converted"] },
                { $toDouble: { $ifNull: ["$budget", 0] } },
                0,
              ],
            },
          },
          totalPipeline: {
            $sum: {
              $cond: [
                { $ne: ["$status", "Converted"] },
                { $toDouble: { $ifNull: ["$budget", 0] } },
                0,
              ],
            },
          },
        },
      },
    ]);

    const totalRevenue = financialAggregation[0]?.totalRevenue || 0;
    const totalPipeline = financialAggregation[0]?.totalPipeline || 0;
    // Business Logic: Profit is 20% of Revenue
    const totalProfit = totalRevenue * 0.2;

    const managers = await User.find({ role: "manager" }).select("-password");

    const managerPerformance = await Promise.all(
      managers.map(async (mgr) => {
        const agentIds = await User.find({ managedBy: mgr._id }).distinct(
          "_id",
        );
        const teamStats = await Lead.aggregate([
          { $match: { assignedTo: { $in: [mgr._id, ...agentIds] } } },
          {
            $group: {
              _id: null,
              revenue: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "Converted"] },
                    { $toDouble: { $ifNull: ["$budget", 0] } },
                    0,
                  ],
                },
              },
            },
          },
        ]);

        const teamRev = teamStats[0]?.revenue || 0;
        return {
          managerName: mgr.name,
          teamProfit: teamRev * 0.2, // Consistently showing 20% profit for the chart
        };
      }),
    );

    const agents = await User.find({ role: "agent" }).select("-password");

    // Map agents to include their calculated revenue for sorting
    const agentsWithRevenue = await Promise.all(
      agents.map(async (agent) => {
        const agentRev = await Lead.aggregate([
          { $match: { assignedTo: agent._id, status: "Converted" } },
          {
            $group: {
              _id: null,
              total: { $sum: { $toDouble: { $ifNull: ["$budget", 0] } } },
            },
          },
        ]);
        return { ...agent.toObject(), revenue: agentRev[0]?.total || 0 };
      }),
    );

    const topAgents = agentsWithRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.status(200).json({
      stats: {
        totalRevenue,
        totalPipeline, // Added for Dashboard
        totalProfit,
        totalAgents,
        totalManagers,
      },
      managerPerformance,
      topAgents,
      managersList: managers,
      agentsList: agents,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

//  2. Multi-Agent Assignment Logic (No changes to logic)
exports.assignTeam = async (req, res) => {
  try {
    const { managerId, agentIds } = req.body;

    if (!managerId) {
      return res.status(400).json({ error: "Manager ID is required" });
    }

    await User.updateMany(
      { managedBy: managerId },
      { $set: { managedBy: null } },
    );

    if (agentIds && agentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: agentIds } },
        { $set: { managedBy: managerId } },
      );
    }

    res.status(200).json({
      success: true,
      message: `${agentIds ? agentIds.length : 0} agents linked successfully.`,
    });
  } catch (err) {
    res.status(500).json({ error: "Bulk assignment failed" });
  }
};

// ==========================================
// 🛡️ THE GOD MODE (Manage Roles & Fire)
// ==========================================

// 3. Update User Role (Agent to Manager or vice versa)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Security Check: Only Admins can do this
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only Admins can change roles" });
    }

    // Safety Check: Admin cannot demote themselves
    if (req.user.id === id || req.user._id.toString() === id) {
      return res
        .status(400)
        .json({ message: "You cannot change your own admin role" });
    }

    if (!["agent", "manager"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Agar manager ko agent banaya ja raha hai, toh uski team ko un-assign karna padega
    if (user.role === "manager" && role === "agent") {
      await User.updateMany({ managedBy: id }, { $set: { managedBy: null } });
    }

    user.role = role;

    // Agar pehle kisi aur manager ke under tha aur ab khud manager ban gaya hai, toh dependency remove karo
    if (role === "manager") {
      user.managedBy = null;
    }

    await user.save();

    res.status(200).json({ message: `Role successfully updated to ${role}` });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
};

// 4. Fire / Delete Employee
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Security Check: Only Admins can do this
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only Admins can delete users" });
    }

    // Safety Check: Admin cannot delete themselves
    if (req.user.id === id || req.user._id.toString() === id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cleanup: Agar wo banda manager tha, toh uske agents ko azaad karna padega
    if (user.role === "manager") {
      await User.updateMany({ managedBy: id }, { $set: { managedBy: null } });
    }

    // Cleanup: Agar is user ke naam par Leads the, unko "Unassigned" (null) karna padega
    await Lead.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });

    // Finally user ko database se uda do
    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({
        message: "Employee has been successfully removed from the system",
      });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to remove employee" });
  }
};
