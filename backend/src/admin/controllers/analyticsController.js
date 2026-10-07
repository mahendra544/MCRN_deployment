const db = require('../../db');

const getAnalytics = async (req, res) => {
  try {
    const [[tc]] = await db.query("SELECT COUNT(*) AS total FROM missing_cases WHERE deleted_at IS NULL");
    const [[tu]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'USER'");
    const [[tp]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'POLICE'");
    const [[au]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'USER' AND active = true");
    const [[iu]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'USER' AND active = false");
    const [[ap]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'POLICE' AND active = true");
    const [[ip]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'POLICE' AND active = false");

    const [casesByStatus] = await db.query("SELECT status, COUNT(*) AS count FROM missing_cases WHERE deleted_at IS NULL GROUP BY status ORDER BY count DESC");
    const [casesByPriority] = await db.query("SELECT 'Medium' AS priority, COUNT(*) AS count FROM missing_cases WHERE deleted_at IS NULL");
    const [casesByGender] = await db.query("SELECT gender, COUNT(*) AS count FROM missing_cases WHERE deleted_at IS NULL GROUP BY gender ORDER BY count DESC");
    const [casesByLocation] = await db.query("SELECT last_seen_location AS location, COUNT(*) AS count FROM missing_cases WHERE deleted_at IS NULL GROUP BY last_seen_location ORDER BY count DESC");
    const [casesByAge] = await db.query("SELECT child_age AS age, COUNT(*) AS count FROM missing_cases WHERE deleted_at IS NULL GROUP BY child_age ORDER BY child_age");

    res.json({
      success: true,
      analytics: {
        totalCases: Number((tc && tc.total) || 0),
        totalUsers: Number((tu && tu.total) || 0),
        totalPolice: Number((tp && tp.total) || 0),
        activeUsers: Number((au && au.total) || 0),
        inactiveUsers: Number((iu && iu.total) || 0),
        activePolice: Number((ap && ap.total) || 0),
        inactivePolice: Number((ip && ip.total) || 0),
        casesByStatus: casesByStatus || [],
        casesByPriority: casesByPriority || [],
        casesByGender: casesByGender || [],
        casesByLocation: casesByLocation || [],
        casesByAge: casesByAge || []
      }
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

module.exports = { getAnalytics };
