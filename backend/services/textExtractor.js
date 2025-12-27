const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs").promises;

/**
 * Extract text from PDF file
 */
exports.extractFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

/**
 * Extract text from DOCX file
 */
exports.extractFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
};
