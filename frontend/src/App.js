import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import ResumeUpload from "./components/ResumeUpload";
import ResultDashboard from "./components/ResultDashboard";
import History from "./components/History";
import CompareAnalyses from "./components/CompareAnalyses";
import ProgressDashboard from "./components/ProgressDashboard";
import { getCurrentUser, logout, getAnalysisById } from "./services/api";

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("upload"); // upload, history, compare, results, progress
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      setAnalysisResult(null);
      setJobRole("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAnalysisComplete = (analysis, role) => {
    setAnalysisResult(analysis);
    setJobRole(role);
    setCurrentView("results");
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setJobRole("");
    setCurrentView("upload");
  };

  const handleViewHistory = () => {
    setCurrentView("history");
  };

  const handleViewAnalysis = async (id) => {
    try {
      const response = await getAnalysisById(id);
      if (response.success) {
        setAnalysisResult(response.analysis);
        setJobRole(response.analysis.job_role);
        setCurrentView("results");
      }
    } catch (error) {
      console.error("Failed to load analysis:", error);
    }
  };

  const handleCompare = (ids) => {
    setCompareIds(ids);
    setCurrentView("compare");
  };

  const handleBackToHistory = () => {
    setCurrentView("history");
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="App">
      {/* User Info Bar */}
      <div className="user-bar">
        <div className="user-info">
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="user-name">{user?.name}</span>
        </div>
        <div className="nav-buttons">
          <button
            onClick={() => setCurrentView("upload")}
            className={`nav-btn ${currentView === "upload" ? "active" : ""}`}
          >
            📤 Upload Resume
          </button>
          <button
            onClick={handleViewHistory}
            className={`nav-btn ${currentView === "history" ? "active" : ""}`}
          >
            📚 History
          </button>
          <button
            onClick={() => setCurrentView("progress")}
            className={`nav-btn ${currentView === "progress" ? "active" : ""}`}
          >
            📊 Progress
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      {currentView === "upload" && (
        <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
      )}

      {currentView === "history" && (
        <History
          onViewAnalysis={handleViewAnalysis}
          onCompare={handleCompare}
        />
      )}

      {currentView === "progress" && <ProgressDashboard />}

      {currentView === "compare" && (
        <CompareAnalyses
          analysisIds={compareIds}
          onBack={handleBackToHistory}
        />
      )}

      {currentView === "results" && (
        <ResultDashboard
          analysis={analysisResult}
          jobRole={jobRole}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
