const Task = require("../models/Task");

// 1. Create Task
exports.createTask = async (req, res) => {
  try {
    // Frontend 'lead' bhej raha hai, hum use 'relatedLead' mein map karenge
    const {
      title,
      description,
      dueDate,
      priority,
      status,
      lead,
      relatedProperty,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo: req.user._id || req.user.userId, // Secure: Logged in user lo
      relatedLead: lead || null, // Fix: Frontend 'lead' ko Schema ke 'relatedLead' se joda
      relatedProperty: relatedProperty || null,
    });

    await task.save();
    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. Get All Tasks (Sirf Logged-in User ke)
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;

    // ✅ Sirf apne tasks dhoondo
    const tasks = await Task.find({ assignedTo: userId })
      .populate("relatedLead", "name email phone") // Lead details
      .populate("relatedProperty", "title address") // Property details
      .sort({ dueDate: 1 }); // Jo pehle karna hai wo upar

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. Get Task by ID (Security Check ke saath)
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("relatedLead", "name email")
      .populate("relatedProperty", "title");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ Check: Kya ye task mera hai?
    if (
      task.assignedTo.toString() !==
      (req.user._id || req.user.userId).toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. Update Task
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ Security Check
    if (
      task.assignedTo.toString() !==
      (req.user._id || req.user.userId).toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Frontend 'lead' bhej sakta hai, use handle karo
    const updateData = { ...req.body, updatedAt: Date.now() };
    if (req.body.lead) updateData.relatedLead = req.body.lead;

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.status(200).json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 5. Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ Security Check
    if (
      task.assignedTo.toString() !==
      (req.user._id || req.user.userId).toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
