const db = require("./config/database");

/**
 * Initialize resume_analyses table for history tracking
 */
function initHistoryTable() {
  console.log("🔧 Creating resume_analyses table...");

  db.run(
    `
    CREATE TABLE IF NOT EXISTS resume_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT,
      job_role TEXT NOT NULL,
      resume_text TEXT NOT NULL,
      match_percentage INTEGER NOT NULL,
      matched_skills TEXT NOT NULL,
      missing_skills TEXT NOT NULL,
      learning_roadmap TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("❌ Error creating resume_analyses table:", err);
        return;
      }
      console.log("✅ resume_analyses table created successfully");

      // Close database connection
      db.close((err) => {
        if (err) {
          console.error("❌ Error closing database:", err);
        } else {
          console.log("✅ Database connection closed");
        }
      });
    }
  );
}

// Run initialization
initHistoryTable();
