const db = require("./config/database");

/**
 * Initialize database schema and seed data
 */
function initDatabase() {
  console.log("🔧 Initializing database...");

  // Create job_skills table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS job_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_role TEXT NOT NULL UNIQUE,
      required_skills TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("❌ Error creating table:", err);
        return;
      }
      console.log("✅ Table created successfully");

      // Seed data
      seedData();
    }
  );
}

/**
 * Seed job roles and required skills
 */
function seedData() {
  const jobRoles = [
    {
      job_role: "Frontend Developer",
      required_skills: JSON.stringify([
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "TypeScript",
        "Redux",
        "Webpack",
        "Git",
        "Responsive Design",
        "RESTful APIs",
        "Testing (Jest/React Testing Library)",
        "CSS Preprocessors (SASS/LESS)",
        "npm/yarn",
      ]),
    },
    {
      job_role: "Backend Developer",
      required_skills: JSON.stringify([
        "Node.js",
        "Express.js",
        "Python",
        "Django/Flask",
        "SQL",
        "PostgreSQL",
        "MongoDB",
        "RESTful APIs",
        "GraphQL",
        "Authentication (JWT/OAuth)",
        "Docker",
        "Redis",
        "Git",
        "Microservices",
        "API Security",
      ]),
    },
    {
      job_role: "Data Analyst",
      required_skills: JSON.stringify([
        "Python",
        "SQL",
        "Excel",
        "Tableau",
        "Power BI",
        "Statistics",
        "Data Visualization",
        "Pandas",
        "NumPy",
        "Matplotlib",
        "Seaborn",
        "Data Cleaning",
        "ETL Processes",
        "Business Intelligence",
        "R",
      ]),
    },
    {
      job_role: "AI Engineer",
      required_skills: JSON.stringify([
        "Python",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "scikit-learn",
        "NLP",
        "Computer Vision",
        "Neural Networks",
        "Pandas",
        "NumPy",
        "Model Deployment",
        "MLOps",
        "Docker",
        "Cloud Platforms (AWS/GCP/Azure)",
        "SQL",
      ]),
    },
    {
      job_role: "Full Stack Developer",
      required_skills: JSON.stringify([
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "PostgreSQL",
        "HTML",
        "CSS",
        "Git",
        "RESTful APIs",
        "Docker",
        "CI/CD",
        "AWS/Cloud",
        "Testing",
        "Agile/Scrum",
      ]),
    },
    {
      job_role: "DevOps Engineer",
      required_skills: JSON.stringify([
        "Linux",
        "Docker",
        "Kubernetes",
        "Jenkins",
        "CI/CD",
        "AWS/GCP/Azure",
        "Terraform",
        "Ansible",
        "Git",
        "Bash/Shell Scripting",
        "Python",
        "Monitoring (Prometheus/Grafana)",
        "Nginx",
        "Infrastructure as Code",
        "Networking",
      ]),
    },
    {
      job_role: "Mobile Developer",
      required_skills: JSON.stringify([
        "React Native",
        "Flutter",
        "Dart",
        "JavaScript",
        "TypeScript",
        "iOS Development",
        "Android Development",
        "Swift",
        "Kotlin",
        "RESTful APIs",
        "Git",
        "Mobile UI/UX",
        "App Store Deployment",
        "Firebase",
      ]),
    },
    {
      job_role: "Data Scientist",
      required_skills: JSON.stringify([
        "Python",
        "R",
        "Machine Learning",
        "Statistics",
        "Deep Learning",
        "SQL",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "TensorFlow",
        "PyTorch",
        "Data Visualization",
        "Jupyter",
        "Feature Engineering",
        "Model Evaluation",
        "Big Data",
      ]),
    },
  ];

  const insertStmt = db.prepare(
    "INSERT OR IGNORE INTO job_skills (job_role, required_skills) VALUES (?, ?)"
  );

  let insertedCount = 0;
  jobRoles.forEach((role) => {
    insertStmt.run(role.job_role, role.required_skills, (err) => {
      if (err) {
        console.error(`❌ Error inserting ${role.job_role}:`, err);
      } else {
        insertedCount++;
        console.log(`✅ Inserted: ${role.job_role}`);
      }
    });
  });

  insertStmt.finalize(() => {
    console.log(`\n🎉 Database initialized with ${insertedCount} job roles`);

    // Close database connection
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err);
      } else {
        console.log("✅ Database connection closed");
      }
    });
  });
}

// Run initialization
initDatabase();
