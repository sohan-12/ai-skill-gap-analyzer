import React, { useState } from "react";
import "./ResumeUpload.css";
import { uploadResume, analyzeSkills } from "../services/api";

const ResumeUpload = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [inputMode, setInputMode] = useState("predefined"); // "predefined" or "custom"
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  const jobRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "AI Engineer",
    "DevOps Engineer",
    "Mobile Developer",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF or DOCX file");
        setFile(null);
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!file) {
      setError("Please upload your resume");
      return;
    }

    if (inputMode === "predefined" && !jobRole) {
      setError("Please select a job role");
      return;
    }

    if (inputMode === "custom" && !customJobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    setLoading(true);
    setUploadProgress("Uploading resume...");

    try {
      // Step 1: Upload and extract text
      const uploadResponse = await uploadResume(file);

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Failed to upload resume");
      }

      setUploadProgress("Analyzing skills with AI...");

      // Step 2: Analyze skills
      const analysisResponse = await analyzeSkills(
        uploadResponse.extractedText,
        inputMode === "predefined" ? jobRole : null,
        inputMode === "custom" ? customJobDescription : null
      );

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.message || "Failed to analyze skills");
      }

      setUploadProgress("Analysis complete!");

      // Pass results to parent component
      onAnalysisComplete(
        analysisResponse.analysis,
        inputMode === "predefined" ? jobRole : "Custom Job Description"
      );
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h1>🎯 AI Skill-Gap Analyzer</h1>
          <p>Discover missing skills and get a personalized learning roadmap</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="resume">Upload Resume</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="resume"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                disabled={loading}
              />
              {file && <div className="file-selected">📄 {file.name}</div>}
            </div>
            <small>Supported formats: PDF, DOCX (Max 5MB)</small>
          </div>

          {/* Input Mode Toggle */}
          <div className="form-group">
            <label>Job Matching Method</label>
            <div className="toggle-buttons">
              <button
                type="button"
                className={`toggle-btn ${
                  inputMode === "predefined" ? "active" : ""
                }`}
                onClick={() => setInputMode("predefined")}
                disabled={loading}
              >
                📋 Predefined Roles
              </button>
              <button
                type="button"
                className={`toggle-btn ${
                  inputMode === "custom" ? "active" : ""
                }`}
                onClick={() => setInputMode("custom")}
                disabled={loading}
              >
                ✍️ Custom Job Description
              </button>
            </div>
          </div>

          {/* Predefined Job Role Selection */}
          {inputMode === "predefined" && (
            <div className="form-group">
              <label htmlFor="jobRole">Target Job Role</label>
              <select
                id="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                disabled={loading}
                required={inputMode === "predefined"}
              >
                <option value="">Select a job role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Job Description Input */}
          {inputMode === "custom" && (
            <div className="form-group">
              <label htmlFor="jobDescription">Paste Job Description</label>
              <textarea
                id="jobDescription"
                value={customJobDescription}
                onChange={(e) => setCustomJobDescription(e.target.value)}
                disabled={loading}
                required={inputMode === "custom"}
                placeholder="Paste the complete job description here. Include responsibilities, requirements, and required skills..."
                rows="10"
              />
              <small>
                AI will extract required skills from this description
              </small>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Progress Message */}
          {uploadProgress && (
            <div className="progress-message">
              <div className="spinner"></div>
              {uploadProgress}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={
              loading ||
              !file ||
              (inputMode === "predefined" && !jobRole) ||
              (inputMode === "custom" && !customJobDescription.trim())
            }
          >
            {loading ? "Analyzing..." : "Analyze Skills"}
          </button>
        </form>

        <div className="upload-footer">
          <p>Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
