import React, { useState, useEffect } from "react";
import {
  getProgress,
  updateProgress,
  getAchievements,
  getProgressStats,
} from "../services/api";
import "./ProgressDashboard.css";

const ProgressDashboard = () => {
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalSkills: 0,
    completedSkills: 0,
    inProgressSkills: 0,
    recentlyCompleted: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);

  const badgeIcons = {
    "First Step": "🎯",
    "Skill Explorer": "🔍",
    "Skill Master": "🏆",
    "Skill Legend": "👑",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressData, achievementsData, statsData] = await Promise.all([
        getProgress(),
        getAchievements(),
        getProgressStats(),
      ]);

      console.log("Progress data:", progressData);
      console.log("Achievements data:", achievementsData);
      console.log("Stats data:", statsData);

      setSkills(progressData.skills || []);
      setAchievements(achievementsData.achievements || []);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      console.error("Error response:", err.response);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load progress data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (skillName) => {
    try {
      const skill = skills.find((s) => s.skill_name === skillName);
      const newStatus =
        skill.status === "completed" ? "in-progress" : "completed";

      // Optimistically update the UI
      setSkills((prevSkills) =>
        prevSkills.map((s) =>
          s.skill_name === skillName
            ? {
                ...s,
                status: newStatus,
                completed_at:
                  newStatus === "completed" ? new Date().toISOString() : null,
              }
            : s
        )
      );

      // Update stats optimistically
      setStats((prevStats) => {
        const isNowCompleted = newStatus === "completed";
        return {
          ...prevStats,
          completedSkills: isNowCompleted
            ? prevStats.completedSkills + 1
            : prevStats.completedSkills - 1,
          inProgressSkills: isNowCompleted
            ? prevStats.inProgressSkills - 1
            : prevStats.inProgressSkills + 1,
        };
      });

      // Send update to backend
      await updateProgress(skillName, newStatus, skill.notes);

      // Fetch achievements in background (non-blocking)
      getAchievements()
        .then((data) => {
          setAchievements(data.achievements || []);
        })
        .catch(console.error);
    } catch (err) {
      console.error("Error updating skill:", err);
      alert("Failed to update skill status");
      // Revert on error
      fetchData();
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await updateProgress(newSkillName, "in-progress");
      setNewSkillName("");
      setShowAddSkill(false);
      await fetchData();
    } catch (err) {
      console.error("Error adding skill:", err);
      alert("Failed to add skill");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = () => {
    if (stats.totalSkills === 0) return 0;
    return Math.round((stats.completedSkills / stats.totalSkills) * 100);
  };

  if (loading) {
    return (
      <div className="progress-dashboard loading">Loading progress...</div>
    );
  }

  if (error) {
    return <div className="progress-dashboard error">{error}</div>;
  }

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h1>📊 Progress Dashboard</h1>
        <p>Track your skill development journey</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSkills}</div>
            <div className="stat-label">Total Skills</div>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedSkills}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgressSkills}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{calculateProgress()}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <p className="progress-text">
          {stats.completedSkills} of {stats.totalSkills} skills completed
        </p>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="achievements-section">
          <h2>🏆 Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-badge">
                <div className="badge-icon">
                  {badgeIcons[achievement.badge_name] || "⭐"}
                </div>
                <div className="badge-name">{achievement.badge_name}</div>
                <div className="badge-date">
                  {formatDate(achievement.earned_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      <div className="skills-section">
        <div className="section-header">
          <h2>🎯 Your Skills</h2>
          <button
            className="add-skill-btn"
            onClick={() => setShowAddSkill(!showAddSkill)}
          >
            {showAddSkill ? "Cancel" : "+ Add Skill"}
          </button>
        </div>

        {showAddSkill && (
          <form onSubmit={handleAddSkill} className="add-skill-form">
            <input
              type="text"
              placeholder="Enter skill name..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="skill-input"
            />
            <button type="submit" className="submit-btn">
              Add
            </button>
          </form>
        )}

        {skills.length === 0 ? (
          <div className="empty-state">
            <p>
              No skills tracked yet. Start by adding skills from your resume
              analysis!
            </p>
          </div>
        ) : (
          <div className="skills-grid">
            {skills.map((skill) => (
              <div key={skill.id} className={`skill-card ${skill.status}`}>
                <div className="skill-header">
                  <h3>{skill.skill_name}</h3>
                  <span className={`status-badge ${skill.status}`}>
                    {skill.status === "completed" ? "✓" : "○"}
                  </span>
                </div>
                <div className="skill-dates">
                  <div className="date-item">
                    <span className="date-label">Started:</span>
                    <span className="date-value">
                      {formatDate(skill.started_at)}
                    </span>
                  </div>
                  {skill.completed_at && (
                    <div className="date-item">
                      <span className="date-label">Completed:</span>
                      <span className="date-value">
                        {formatDate(skill.completed_at)}
                      </span>
                    </div>
                  )}
                </div>
                {skill.notes && (
                  <div className="skill-notes">
                    <p>{skill.notes}</p>
                  </div>
                )}
                <button
                  className={`mark-complete-btn ${skill.status}`}
                  onClick={() => handleMarkComplete(skill.skill_name)}
                >
                  {skill.status === "completed"
                    ? "Mark as In Progress"
                    : "Mark as Complete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Completed */}
      {stats.recentlyCompleted && stats.recentlyCompleted.length > 0 && (
        <div className="recent-section">
          <h2>🎉 Recently Completed</h2>
          <div className="recent-list">
            {stats.recentlyCompleted.map((skill, index) => (
              <div key={index} className="recent-item">
                <span className="recent-icon">✓</span>
                <span className="recent-skill">{skill.skill_name}</span>
                <span className="recent-date">
                  {formatDate(skill.completed_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
