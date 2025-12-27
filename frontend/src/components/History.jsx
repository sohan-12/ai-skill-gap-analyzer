import React, { useState, useEffect } from "react";
import "./History.css";
import { getHistory, deleteAnalysis } from "../services/api";

const History = ({ onViewAnalysis, onCompare }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getHistory();
      if (response.success) {
        setHistory(response.history);
      }
    } catch (err) {
      setError("Failed to load history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) {
      return;
    }

    try {
      await deleteAnalysis(id);
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to delete analysis");
      console.error(err);
    }
  };

  const toggleCompareSelection = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        setError("You can only compare 2 analyses at a time");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      onCompare(selectedForCompare);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return "#4caf50";
    if (percentage >= 50) return "#ff9800";
    return "#f44336";
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>📚 Analysis History</h1>
        <p>View and compare your past resume analyses</p>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {selectedForCompare.length === 2 && (
        <div className="compare-banner">
          <span>{selectedForCompare.length} analyses selected</span>
          <button onClick={handleCompare} className="compare-btn">
            Compare Selected
          </button>
          <button
            onClick={() => setSelectedForCompare([])}
            className="clear-btn"
          >
            Clear Selection
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Analysis History Yet</h2>
          <p>Your analyzed resumes will appear here</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div
              key={item.id}
              className={`history-card ${
                selectedForCompare.includes(item.id) ? "selected" : ""
              }`}
            >
              <div className="card-header">
                <h3>{item.job_role}</h3>
                <div
                  className="score-badge"
                  style={{
                    backgroundColor: getScoreColor(item.match_percentage),
                  }}
                >
                  {item.match_percentage}%
                </div>
              </div>

              <div className="card-date">📅 {formatDate(item.created_at)}</div>

              <div className="card-actions">
                <button
                  onClick={() => onViewAnalysis(item.id)}
                  className="action-btn view-btn"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => toggleCompareSelection(item.id)}
                  className={`action-btn compare-btn ${
                    selectedForCompare.includes(item.id) ? "active" : ""
                  }`}
                >
                  {selectedForCompare.includes(item.id)
                    ? "✓ Selected"
                    : "⚖️ Compare"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="action-btn delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
