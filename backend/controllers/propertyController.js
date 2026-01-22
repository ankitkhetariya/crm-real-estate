const Property = require('../models/Property');

// 1. Create Property
exports.createProperty = async (req, res) => {
    try {
        // Logged in user ko assign karein
        req.body.assignedTo = req.user._id || req.user.userId;

        const newProperty = await Property.create(req.body);
        res.status(201).json(newProperty);
    } catch (error) {
        console.error("Error creating property:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Get All Properties (Jo user login hai sirf uski)
exports.getAllProperties = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        // Latest property sabse upar (createdAt: -1)
        const properties = await Property.find({ assignedTo: userId }).sort({ createdAt: -1 });
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Get Single Property
exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
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

        // Check ownership (Kya ye property is user ki hai?)
        const userId = req.user._id || req.user.userId;
        if (property.assignedTo.toString() !== userId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 5. Delete Property (Single)
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const userId = req.user._id || req.user.userId;
        if (property.assignedTo.toString() !== userId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await property.deleteOne();
        res.status(200).json({ message: 'Property removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 🗑️ 6. DELETE ALL PROPERTIES (NEW ADDED)
exports.deleteAllProperties = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        
        // Sirf login user ka data delete hoga
        await Property.deleteMany({ assignedTo: userId });

        res.status(200).json({ message: "All properties deleted successfully" });
    } catch (error) {
        console.error("Delete All Error:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};