const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Google OAuth routes
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);

// Logout route
router.post("/logout", authController.logout);

// Get current user
router.get("/user", authController.getCurrentUser);

module.exports = router;
