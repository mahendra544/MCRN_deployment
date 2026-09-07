const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "backend_user",
  password: "backend123",
  database: "missing_child_db"
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return;
  }

  console.log("✅ MySQL connected successfully!");
});

module.exports = db;
