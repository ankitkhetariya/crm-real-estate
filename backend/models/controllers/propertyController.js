const Property = require('../models/Property');
const User = require('../models/User'); 

// 1. Create Property
exports.createProperty = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authenticated" });
        
        req.body.assignedTo = req.user._id || req.user.userId;

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

// 2. Get All Properties (Manager Team Visibility Fix)
exports.getAllProperties = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
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

        const properties = await Property.find(query)
            .sort({ createdAt: -1 })
            .populate('owner', 'name email phone');

        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Get Single Property
exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner');
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. Update Property
exports.updateProperty = async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const userId = req.user._id || req.user.userId;
        const role = req.user.role;

        // Auth logic: Admins, Managers (for team), or Owner can update
        if (role === 'manager') {
            const teamAgents = await User.find({ managedBy: userId }).distinct('_id');
            const isTeamProp = teamAgents.map(id => id.toString()).includes(property.assignedTo.toString());
            if (property.assignedTo.toString() !== userId.toString() && !isTeamProp) {
                return res.status(401).json({ message: 'Not authorized' });
            }
        } else if (role !== 'admin' && property.assignedTo.toString() !== userId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.body.owner === "" || req.body.owner === "null") req.body.owner = null;

        property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 5. Delete Property
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const userId = req.user._id || req.user.userId;
        if (req.user.role !== 'admin' && property.assignedTo.toString() !== userId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await property.deleteOne();
        res.status(200).json({ message: 'Property removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 6. Delete All Properties
exports.deleteAllProperties = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        await Property.deleteMany({ assignedTo: userId });
        res.status(200).json({ message: "All properties deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};