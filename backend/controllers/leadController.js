const Lead = require("../models/Lead");
const User = require("../models/User");
const Task = require("../models/Task");

/**
 * SENIOR DEV LOGIC: Robust 10-Digit Mobile Number Validation
 * - Handles both String and Number types safely
 * - Trims accidental whitespace
 * - Enforces exactly 10 digits (0-9)
 * - Blocks dummy numbers like "0000000000"
 */
const isValidMobileNumber = (phone) => {
  if (!phone) return true; // Let Mongoose schema handle "required" logic

  const phoneStr = String(phone).trim(); // Safely convert to string and remove spaces

  // Regex: Exactly 10 digits
  const isValidFormat = /^\d{10}$/.test(phoneStr);
  const isNotAllZeros = phoneStr !== "0000000000";

  return isValidFormat && isNotAllZeros;
};

// 1. Stats logic (UPDATED FOR MANAGER HIERARCHY & PIPELINE)
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId || req.user.id;
    const role = req.user.role;
    let query = {};

    // --- HIERARCHY LOGIC ---
    if (role === "admin") {
      query = {}; // Admin sees everything
    } else if (role === "manager") {
      // Find all agents managed by this manager
      const teamAgents = await User.find({ managedBy: userId }).distinct("_id");
      // Manager sees their own leads + their team's leads
      query = { assignedTo: { $in: [userId, ...teamAgents] } };
    } else {
      query = { assignedTo: userId }; // Agent sees only theirs
    }

    const activeTasksQuery = {
      ...query,
      status: { $in: ["pending", "in-progress"] },
    };

    const [totalLeads, aggregation, activeTasksCount] = await Promise.all([
      Lead.countDocuments(query),
      Lead.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            // Revenue: Sum budget only if status is "Converted"
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Converted"] },
                  { $toDouble: { $ifNull: ["$budget", 0] } },
                  0,
                ],
              },
            },
            //  Pipeline: Sum budget for all other active statuses
            pipeline: {
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
      ]),
      Task.countDocuments(activeTasksQuery),
    ]);

    // Extract totals from the aggregation array
    const totalRevenue = aggregation.reduce(
      (acc, curr) => acc + (curr.revenue || 0),
      0,
    );
    const totalPipeline = aggregation.reduce(
      (acc, curr) => acc + (curr.pipeline || 0),
      0,
    );
    const convertedCount =
      aggregation.find((a) => a._id === "Converted")?.count || 0;

    const conversionRate =
      totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : 0;

    res.status(200).json({
      totalLeads,
      totalRevenue,
      totalPipeline,
      conversionRate: Number(conversionRate),
      statusCounts: aggregation,
      activeTasksCount: activeTasksCount,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error" });
  }
};

//  2. Get All (with pagination, search, status, assignedTo, and budget filter)
exports.getAllLeads = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    // 1. BASE QUERY START
    let query = {};

    // 2. ROLE HIERARCHY LOGIC
    if (role === "manager") {
      const teamAgents = await User.find({ managedBy: userId }).distinct("_id");
      query.assignedTo = { $in: [userId, ...teamAgents] };
    } else if (role !== "admin") {
      query.assignedTo = userId;
    }

    // 3. EXTRACT FILTERS
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const search = (req.query.search || "").trim();
    const statusFilter = req.query.status;
    const assignedToFilter = req.query.assignedTo;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    // 4. APPLY BUDGET FILTER
    if (minPrice || maxPrice) {
      query.budget = {};
      if (minPrice) query.budget.$gte = Number(minPrice);
      if (maxPrice) query.budget.$lte = Number(maxPrice);
    }

    // 5. APPLY SEARCH FILTER
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    // 6. APPLY STATUS FILTER
    if (statusFilter && statusFilter !== "All") {
      const valid = [
        "New",
        "Contacted",
        "Qualified",
        "Proposal Sent",
        "Lost",
        "Converted",
      ];
      if (valid.includes(statusFilter)) query.status = statusFilter;
    }

    // 7. APPLY ASSIGNED USER FILTER OVERRIDE
    if (assignedToFilter && (role === "admin" || role === "manager")) {
      query.assignedTo = assignedToFilter;
    }

    // EXECUTE DB QUERY
    const total = await Lead.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ data: leads, total, page, limit, totalPages });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// 3. Create
exports.createLead = async (req, res) => {
  try {
    // PROPER VALIDATION CHECK
    if (req.body.phone && !isValidMobileNumber(req.body.phone)) {
      return res.status(400).json({
        message:
          "Invalid phone number. Please enter a valid 10-digit mobile number.",
      });
    }

    // Logic: Check if user sent an 'assignedTo' ID AND has permission to assign
    let assignee = req.user.id;

    if (
      req.body.assignedTo &&
      (req.user.role === "admin" || req.user.role === "manager")
    ) {
      assignee = req.body.assignedTo;
    }

    const newLead = new Lead({
      ...req.body,
      assignedTo: assignee,
    });

    await newLead.save();
    res.status(201).json(newLead);
  } catch (error) {
    console.error("Create Lead Error:", error);
    res.status(500).json({ message: "Error creating lead" });
  }
};

// 4. Get By ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// 5. Update
exports.updateLead = async (req, res) => {
  try {
    // PROPER VALIDATION CHECK
    if (req.body.phone && !isValidMobileNumber(req.body.phone)) {
      return res.status(400).json({
        message:
          "Invalid phone number. Please enter a valid 10-digit mobile number.",
      });
    }

    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// 6. Delete
exports.deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// 7. Delete All
exports.deleteAllLeads = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Lead.deleteMany({ assignedTo: userId });
    res.status(200).json({ message: "All deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};
