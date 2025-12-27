const express = require("express");
const historyController = require("../controllers/historyController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get user's analysis history
router.get("/", historyController.getUserHistory);

// Get specific analysis by ID
router.get("/:id", historyController.getAnalysisById);

// Delete an analysis
router.delete("/:id", historyController.deleteAnalysis);

// Compare multiple analyses
router.post("/compare", historyController.compareAnalyses);

module.exports = router;
