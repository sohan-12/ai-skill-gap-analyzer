const db = require("../config/database");

/**
 * Get user's skill progress
 */
exports.getProgress = (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM skill_progress
      WHERE user_id = ?
      ORDER BY started_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Error retrieving progress",
        });
      }

      res.json({
        success: true,
        skills: rows,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving progress",
    });
  }
};

/**
 * Add or update skill progress
 */
exports.updateProgress = (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { skill_name, status, notes } = req.body;

    if (!skill_name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const completed_at =
      status === "completed" ? new Date().toISOString() : null;

    const query = `
      INSERT INTO skill_progress (user_id, user_email, skill_name, status, notes, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, skill_name) 
      DO UPDATE SET status = ?, notes = ?, completed_at = ?
    `;

    db.run(
      query,
      [
        userId,
        userEmail,
        skill_name,
        status,
        notes,
        completed_at,
        status,
        notes,
        completed_at,
      ],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Error updating progress",
          });
        }

        // Check for achievements
        checkAndAwardAchievements(userId, userEmail);

        res.json({
          success: true,
          message: "Progress updated successfully",
        });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
    });
  }
};

/**
 * Get user's achievements
 */
exports.getAchievements = (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM achievements
      WHERE user_id = ?
      ORDER BY earned_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Error retrieving achievements",
        });
      }

      res.json({
        success: true,
        achievements: rows,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving achievements",
    });
  }
};

/**
 * Get progress statistics
 */
exports.getStats = (req, res) => {
  try {
    const userId = req.user.id;

    const queries = {
      total: `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ?`,
      completed: `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ? AND status = 'completed'`,
      inProgress: `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ? AND status = 'in-progress'`,
      recentlyCompleted: `
        SELECT skill_name, completed_at 
        FROM skill_progress 
        WHERE user_id = ? AND status = 'completed'
        ORDER BY completed_at DESC
        LIMIT 5
      `,
    };

    const stats = {};

    db.get(queries.total, [userId], (err, row) => {
      if (err) {
        console.error("Database error (total):", err);
        return res.status(500).json({
          success: false,
          message: "Error retrieving stats",
        });
      }
      stats.total = row.count;

      db.get(queries.completed, [userId], (err, row) => {
        if (err) {
          console.error("Database error (completed):", err);
          return res.status(500).json({
            success: false,
            message: "Error retrieving stats",
          });
        }
        stats.completed = row.count;

        db.get(queries.inProgress, [userId], (err, row) => {
          if (err) {
            console.error("Database error (inProgress):", err);
            return res.status(500).json({
              success: false,
              message: "Error retrieving stats",
            });
          }
          stats.inProgress = row.count;

          db.all(queries.recentlyCompleted, [userId], (err, rows) => {
            if (err) {
              console.error("Database error (recentlyCompleted):", err);
              return res.status(500).json({
                success: false,
                message: "Error retrieving stats",
              });
            }

            res.json({
              success: true,
              totalSkills: stats.total,
              completedSkills: stats.completed,
              inProgressSkills: stats.inProgress,
              recentlyCompleted: rows,
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving stats",
    });
  }
};

/**
 * Check and award achievements based on progress
 */
function checkAndAwardAchievements(userId, userEmail) {
  const query = `
    SELECT COUNT(*) as completed_count
    FROM skill_progress
    WHERE user_id = ? AND status = 'completed'
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("Error checking achievements:", err);
      return;
    }

    const completedCount = row.completed_count;
    const badges = [];

    // Define achievement milestones
    if (completedCount >= 1)
      badges.push({ type: "first_skill", name: "First Step" });
    if (completedCount >= 5)
      badges.push({ type: "skill_explorer", name: "Skill Explorer" });
    if (completedCount >= 10)
      badges.push({ type: "skill_master", name: "Skill Master" });
    if (completedCount >= 20)
      badges.push({ type: "skill_legend", name: "Skill Legend" });

    // Award new badges
    badges.forEach((badge) => {
      const insertQuery = `
        INSERT OR IGNORE INTO achievements (user_id, user_email, badge_type, badge_name)
        VALUES (?, ?, ?, ?)
      `;

      db.run(
        insertQuery,
        [userId, userEmail, badge.type, badge.name],
        (err) => {
          if (err) {
            console.error("Error awarding badge:", err);
          } else {
            console.log(`🏆 Badge awarded: ${badge.name} to user ${userId}`);
          }
        }
      );
    });
  });
}
