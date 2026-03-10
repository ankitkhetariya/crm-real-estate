const multer = require("multer");
const path = require("path");
const fs = require("fs");

const brochuresDir = path.join(__dirname, "../uploads/brochures");
if (!fs.existsSync(brochuresDir)) {
  fs.mkdirSync(brochuresDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, brochuresDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `brochure-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = "application/pdf";
  if (file.mimetype === allowed) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for brochures."), false);
  }
};

const uploadBrochure = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { uploadBrochure };
