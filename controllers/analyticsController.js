const db = require("../config/db");

// =====================================
// GET ANALYTICS
// =====================================
const getAnalytics = (req, res) => {
  const queries = {
    totalCases: `
      SELECT COUNT(*) AS total
      FROM missing_cases
    `,

    totalUsers: `
      SELECT COUNT(*) AS total
      FROM users
    `,

    totalPolice: `
      SELECT COUNT(*) AS total
      FROM police
    `,

    activeUsers: `
      SELECT COUNT(*) AS total
      FROM users
      WHERE status = 'Active'
    `,

    inactiveUsers: `
      SELECT COUNT(*) AS total
      FROM users
      WHERE status = 'Inactive'
    `,

    activePolice: `
      SELECT COUNT(*) AS total
      FROM police
      WHERE status = 'Active'
    `,

    inactivePolice: `
      SELECT COUNT(*) AS total
      FROM police
      WHERE status = 'Inactive'
    `,

    casesByStatus: `
      SELECT status, COUNT(*) AS count
      FROM missing_cases
      GROUP BY status
      ORDER BY count DESC
    `,

    casesByPriority: `
      SELECT priority, COUNT(*) AS count
      FROM missing_cases
      GROUP BY priority
      ORDER BY count DESC
    `,

    casesByGender: `
      SELECT gender, COUNT(*) AS count
      FROM missing_cases
      GROUP BY gender
      ORDER BY count DESC
    `,

    casesByLocation: `
      SELECT location, COUNT(*) AS count
      FROM missing_cases
      GROUP BY location
      ORDER BY count DESC
    `,

    casesByAge: `
      SELECT age, COUNT(*) AS count
      FROM missing_cases
      GROUP BY age
      ORDER BY age
    `
  };

  const results = {};

  const queryEntries = Object.entries(queries);

  let completed = 0;

  queryEntries.forEach(([key, sql]) => {
    db.query(sql, (err, data) => {
      if (err) {
        console.error(`Analytics error (${key}):`, err);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch analytics",
          error: err.message
        });
      }

      results[key] = data;

      completed++;

      if (completed === queryEntries.length) {
        res.json({
          success: true,
          analytics: {
            totalCases: results.totalCases[0].total,
            totalUsers: results.totalUsers[0].total,
            totalPolice: results.totalPolice[0].total,

            activeUsers: results.activeUsers[0].total,
            inactiveUsers: results.inactiveUsers[0].total,

            activePolice: results.activePolice[0].total,
            inactivePolice: results.inactivePolice[0].total,

            casesByStatus: results.casesByStatus,
            casesByPriority: results.casesByPriority,
            casesByGender: results.casesByGender,
            casesByLocation: results.casesByLocation,
            casesByAge: results.casesByAge
          }
        });
      }
    });
  });
};

module.exports = {
  getAnalytics
};
