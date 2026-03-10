const path = require("path");
const fs = require("fs");
const Property = require("../models/Property");
const User = require("../models/User");

function deleteBrochureFileIfExists(brochureUrl) {
  if (!brochureUrl || typeof brochureUrl !== "string") return;
  const filename = path.basename(brochureUrl);
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "uploads", "brochures", filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Brochure file delete failed:", err.message);
  }
}

// 1. Create Property (UPDATED FOR MANAGER ASSIGNMENT)
exports.createProperty = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    //  START CHANGE: Logic to determine assignee
    let assignee = req.user._id || req.user.userId;

    // If User is Admin or Manager AND they selected someone in the dropdown, use that ID
    if (
      req.body.assignedTo &&
      (req.user.role === "admin" || req.user.role === "manager")
    ) {
      assignee = req.body.assignedTo;
    }

    req.body.assignedTo = assignee;
    //  END CHANGE

    if (!req.body.owner || req.body.owner === "" || req.body.owner === "null") {
      delete req.body.owner;
    }

    if (!req.body.bedrooms) req.body.bedrooms = [];
    if (!req.body.bathrooms) req.body.bathrooms = [];

    const newProperty = await Property.create(req.body);
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Properties (with pagination and optional search/status filter)
exports.getAllProperties = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const role = req.user.role;
    let query = {};

    if (role === "admin") {
      query = {};
    } else if (role === "manager") {
      const teamAgents = await User.find({ managedBy: userId }).distinct("_id");
      query = { assignedTo: { $in: [userId, ...teamAgents] } };
    } else {
      query = { assignedTo: userId };
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const search = (req.query.search || "").trim();
    const statusFilter = req.query.status;
    const assignedToFilter = req.query.assignedTo;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }
    if (
      statusFilter &&
      statusFilter !== "All" &&
      ["Available", "Sold", "Rented"].includes(statusFilter)
    ) {
      query.status = statusFilter;
    }
    if (assignedToFilter && (role === "admin" || role === "manager")) {
      query.assignedTo = assignedToFilter;
    }

    const total = await Property.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email phone")
      .populate("assignedTo", "name username");

    res.status(200).json({
      data: properties,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Get Single Property
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner");
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Update Property
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    const userId = req.user._id || req.user.userId;
    const role = req.user.role;

    // Auth logic: Admins, Managers (for team), or Owner can update
    if (role === "manager") {
      const teamAgents = await User.find({ managedBy: userId }).distinct("_id");
      const isTeamProp = teamAgents
        .map((id) => id.toString())
        .includes(property.assignedTo.toString());
      if (property.assignedTo.toString() !== userId.toString() && !isTeamProp) {
        return res.status(401).json({ message: "Not authorized" });
      }
    } else if (
      role !== "admin" &&
      property.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.body.owner === "" || req.body.owner === "null")
      req.body.owner = null;

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    const userId = req.user._id || req.user.userId;
    if (
      req.user.role !== "admin" &&
      property.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    deleteBrochureFileIfExists(property.brochureUrl);
    await property.deleteOne();
    res.status(200).json({ message: "Property removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. Delete All Properties
exports.deleteAllProperties = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const toDelete = await Property.find({ assignedTo: userId })
      .select("brochureUrl")
      .lean();
    toDelete.forEach((p) => deleteBrochureFileIfExists(p.brochureUrl));
    await Property.deleteMany({ assignedTo: userId });
    res.status(200).json({ message: "All properties deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. Upload brochure PDF for a property
exports.uploadBrochure = async (req, res) => {
  try {
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const userId = req.user._id || req.user.userId;
    const role = req.user.role;

    if (role === "manager") {
      const teamAgents = await User.find({ managedBy: userId }).distinct("_id");
      const isTeamProp = teamAgents
        .map((id) => id.toString())
        .includes(property.assignedTo.toString());
      if (property.assignedTo.toString() !== userId.toString() && !isTeamProp) {
        return res.status(401).json({ message: "Not authorized" });
      }
    } else if (
      role !== "admin" &&
      property.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const brochureUrl = "/uploads/brochures/" + req.file.filename;
    property.brochureUrl = brochureUrl;
    await property.save();

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// 8. Remove brochure (clear brochureUrl and delete file)
exports.removeBrochure = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const userId = req.user._id || req.user.userId;
    const role = req.user.role;

    if (role === "manager") {
      const teamAgents = await User.find({ managedBy: userId }).distinct("_id");
      const isTeamProp = teamAgents
        .map((id) => id.toString())
        .includes(property.assignedTo.toString());
      if (property.assignedTo.toString() !== userId.toString() && !isTeamProp) {
        return res.status(401).json({ message: "Not authorized" });
      }
    } else if (
      role !== "admin" &&
      property.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    deleteBrochureFileIfExists(property.brochureUrl);
    property.brochureUrl = "";
    await property.save();

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
