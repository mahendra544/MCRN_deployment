const db = require("../../db");

const getDashboardData = async (req, res) => {
  try {
    const [totalRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM children
      WHERE deleted_at IS NULL AND owner_user_id = ?
    `, [req.user.sub]);

    const [activeRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM children
      WHERE deleted_at IS NULL AND owner_user_id = ? AND status = 'Missing'
    `, [req.user.sub]);

    const [resolvedRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM children
      WHERE deleted_at IS NULL AND owner_user_id = ? AND status = 'Reunited'
    `, [req.user.sub]);

    const [recentCases] = await db.query(`
      SELECT
        id,
        case_id,
        name,
        age,
        gender,
        location,
        date_missing,
        status,
        photo,
        created_at
      FROM children
      WHERE deleted_at IS NULL AND owner_user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [req.user.sub]);

    const [recentSightings] = await db.query(`
      SELECT
        s.id,
        s.photo_url,
        s.location,
        s.approximate_age,
        s.gender,
        s.sighting_date,
        s.sighting_time,
        s.description,
        s.reporter_name,
        s.contact_number,
        s.status,
        s.created_at,
        c.case_id,
        c.name AS child_name
      FROM sightings s
      LEFT JOIN children c ON s.case_id = c.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalCases: Number(totalRows && totalRows[0] ? totalRows[0].total : 0),
          activeCases: Number(activeRows && activeRows[0] ? activeRows[0].total : 0),
          resolvedCases: Number(resolvedRows && resolvedRows[0] ? resolvedRows[0].total : 0),
        },
        recentCases: recentCases || [],
        recentSightings: recentSightings || [],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
};
