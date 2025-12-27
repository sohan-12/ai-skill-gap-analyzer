const express = require("express");
const multer = require("multer");
const path = require("path");

const uploadController = require("../controllers/uploadController");
const analyzeController = require("../controllers/analyzeController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resume-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".docx", ".doc"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes - Protected with authentication
router.post(
  "/upload",
  isAuthenticated,
  upload.single("resume"),
  uploadController.uploadResume
);
router.post("/analyze", isAuthenticated, analyzeController.analyzeSkills);

module.exports = router;
