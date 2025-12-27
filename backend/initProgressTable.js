const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

console.log("🔧 Creating skill_progress table...");

db.serialize(() => {
  // Create skill_progress table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS skill_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      status TEXT DEFAULT 'in-progress',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      notes TEXT,
      UNIQUE(user_id, skill_name)
    )
  `,
    (err) => {
      if (err) {
        console.error("❌ Error creating skill_progress table:", err);
      } else {
        console.log("✅ skill_progress table created successfully");
      }
    }
  );

  // Create achievements table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      badge_type TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_type)
    )
  `,
    (err) => {
      if (err) {
        console.error("❌ Error creating achievements table:", err);
      } else {
        console.log("✅ achievements table created successfully");
      }
    }
  );
});

db.close((err) => {
  if (err) {
    console.error("❌ Error closing database:", err);
  } else {
    console.log("✅ Database connection closed");
  }
});
