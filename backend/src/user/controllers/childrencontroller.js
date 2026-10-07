const db = require("../../db");

const DEFAULT_PHOTO = "/default-child.jpg";

function formatChildPhoto(photo) {
  if (!photo || photo.trim() === "") return DEFAULT_PHOTO;
  if (photo.startsWith("http://") || photo.startsWith("https://") || photo.startsWith("/")) return photo;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://oiyckfwjescfzcokjnpf.supabase.co";
  const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "missing-child-images";
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${photo}`;
}

const getChildren = async (req, res) => {
  try {
    const {
      search = "",
      age = "",
      gender = "",
      location = "",
      status = "",
      sighted = "",
    } = req.query;

    let sql = `
      SELECT
        id,
        case_id,
        name,
        age,
        gender,
        location,
        date_missing,
        status,
        sighted,
        photo,
        created_at
      FROM children
      WHERE deleted_at IS NULL
    `;

    const values = [];

    if (search.trim() !== "") {
      sql += `
        AND (
          name LIKE ?
          OR case_id LIKE ?
          OR location LIKE ?
        )
      `;
      const searchValue = `%${search.trim()}%`;
      values.push(searchValue, searchValue, searchValue);
    }

    if (age.trim() !== "") {
      sql += ` AND age = ? `;
      values.push(parseInt(age));
    }

    if (gender.trim() !== "") {
      sql += ` AND gender = ? `;
      values.push(gender);
    }

    if (location.trim() !== "") {
      sql += ` AND location LIKE ? `;
      values.push(`%${location.trim()}%`);
    }

    if (status.trim() !== "") {
      sql += ` AND status = ? `;
      values.push(status);
    }

    if (sighted.trim() !== "") {
      if (sighted === "1") {
        sql += ` AND sighted > 0 `;
      } else if (sighted === "0") {
        sql += ` AND (sighted = 0 OR sighted IS NULL) `;
      }
    }

    const limit = req.query.limit ? Math.min(Math.max(Number(req.query.limit), 1), 500) : null;
    const offset = req.query.offset ? Math.max(Number(req.query.offset), 0) : null;
    sql += ` ORDER BY created_at DESC `;
    if (limit !== null) {
      sql += ` LIMIT ? OFFSET ? `;
      values.push(limit, offset || 0);
    }

    const [rows] = await db.query(sql, values);

    const formattedRows = (rows || []).map((child) => ({
      ...child,
      photo: formatChildPhoto(child.photo),
    }));

    res.json({
      success: true,
      count: formattedRows.length,
      data: formattedRows,
    });
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getChildById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        id,
        case_id,
        name,
        age,
        gender,
        location,
        date_missing,
        status,
        sighted,
        photo,
        created_at
      FROM children
      WHERE (id = ? OR case_id = ?) AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [id, id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Child record not found",
      });
    }

    const child = rows[0];

    child.photo = formatChildPhoto(child.photo);

    res.json({
      success: true,
      data: child,
    });
  } catch (error) {
    console.error("Error fetching child by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const [locations] = await db.query(`
      SELECT DISTINCT location
      FROM children
      WHERE location IS NOT NULL AND location != '' AND deleted_at IS NULL
      ORDER BY location ASC
    `);

    const [ages] = await db.query(`
      SELECT DISTINCT age
      FROM children
      WHERE age IS NOT NULL AND deleted_at IS NULL
      ORDER BY age ASC
    `);

    const [statuses] = await db.query(`
      SELECT DISTINCT status
      FROM children
      WHERE status IS NOT NULL AND status != '' AND deleted_at IS NULL
      ORDER BY status ASC
    `);

    res.json({
      success: true,
      data: {
        locations: (locations || []).map((item) => item.location),
        ages: (ages || []).map((item) => item.age),
        statuses: (statuses || []).map((item) => item.status),
        genders: ["Male", "Female", "Other"],
      },
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getChildren,
  getChildById,
  getFilterOptions,
};
