const fs = require("fs");
const path = require("path");
const textExtractor = require("../services/textExtractor");

/**
 * Upload resume and extract text
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let extractedText = "";

    // Extract text based on file type
    if (fileExtension === ".pdf") {
      extractedText = await textExtractor.extractFromPDF(filePath);
    } else if (fileExtension === ".docx" || fileExtension === ".doc") {
      extractedText = await textExtractor.extractFromDOCX(filePath);
    } else {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "Unsupported file format",
      });
    }

    // Clean up uploaded file after extraction
    fs.unlinkSync(filePath);

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract sufficient text from the resume. Please ensure the file is not empty or corrupted.",
      });
    }

    res.json({
      success: true,
      extractedText: extractedText.trim(),
      message: "Resume processed successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error processing resume: " + error.message,
    });
  }
};
