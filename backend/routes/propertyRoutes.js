const express = require("express");
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  deleteAllProperties,
  uploadBrochure,
  removeBrochure,
} = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");
const { uploadBrochure: uploadBrochureMulter } = require("../config/multer");

router.use(protect);

router.post("/", createProperty);
router.get("/", getAllProperties);
router.delete("/delete-all", deleteAllProperties);

router.get("/:id", getPropertyById);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.post(
  "/:id/brochure",
  (req, res, next) => {
    uploadBrochureMulter.single("brochure")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Invalid file. Only PDF allowed." });
      }
      next();
    });
  },
  uploadBrochure
);
router.delete("/:id/brochure", removeBrochure);

module.exports = router;
