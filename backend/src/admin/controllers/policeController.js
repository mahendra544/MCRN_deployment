const bcrypt = require('bcryptjs');
const db = require('../../db');

const getAllPolice = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.name, u.email, u.phone, u.active, u.created_at,
              p.official_id, p.station, p.police_rank, p.badge_number
       FROM users u
       JOIN police_profiles p ON p.user_id = u.id
       WHERE u.role = 'POLICE'
       ORDER BY u.id DESC`
    );
    res.json({
      success: true,
      police: (rows || []).map((x) => ({
        ...x,
        police_id: x.official_id,
        status: x.active ? 'Active' : 'Inactive'
      }))
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch police officers' });
  }
};

const getPoliceById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.name, u.email, u.phone, u.active, u.created_at,
              p.official_id, p.station, p.police_rank, p.badge_number
       FROM users u
       JOIN police_profiles p ON p.user_id = u.id
       WHERE u.id = $1 AND u.role = 'POLICE'`,
      [req.params.id]
    );
    if (!rows || !rows.length) return res.status(404).json({ success: false, message: 'Police officer not found' });
    const x = rows[0];
    res.json({
      success: true,
      police: {
        ...x,
        police_id: x.official_id,
        status: x.active ? 'Active' : 'Inactive'
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch police officer' });
  }
};

const addPolice = async (req, res) => {
  try {
    const { police_id, name, email, phone, station, police_rank, badge_number, username, password } = req.body;
    if (!police_id || !name || !email || !station || !police_rank || !badge_number || !username || !password) {
      return res.status(400).json({ success: false, message: 'Required police fields are missing' });
    }
    const [ex] = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1', [username, email]);
    if (ex && ex.length) return res.status(409).json({ success: false, message: 'Username or email already exists' });
    const [po] = await db.query('SELECT user_id FROM police_profiles WHERE official_id = $1 LIMIT 1', [police_id]);
    if (po && po.length) return res.status(409).json({ success: false, message: 'Official ID already exists' });

    const hash = await bcrypt.hash(password, 12);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [u] = await conn.query(
        `INSERT INTO users (username, name, email, password_hash, role, verified, active, phone)
         VALUES ($1, $2, $3, $4, 'POLICE', true, true, $5)`,
        [username, name, email, hash, phone || null]
      );
      await conn.query(
        `INSERT INTO police_profiles (user_id, official_id, station, police_rank, badge_number)
         VALUES ($1, $2, $3, $4, $5)`,
        [u.insertId, police_id, station, police_rank, badge_number]
      );
      await conn.commit();
      res.status(201).json({ success: true, message: 'Police officer added successfully', id: u.insertId });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to add police officer' });
  }
};

const updatePolice = async (req, res) => {
  try {
    const { police_id, name, email, phone, station, police_rank, badge_number, username, password } = req.body;
    const fields = ['username = $1', 'name = $2', 'email = $3', 'phone = $4'];
    const vals = [username, name, email, phone];
    let paramIndex = 5;
    if (password) {
      fields.push(`password_hash = $${paramIndex++}`);
      vals.push(await bcrypt.hash(password, 12));
    }
    vals.push(req.params.id);
    const [r] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} AND role = 'POLICE'`,
      vals
    );
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Police officer not found' });
    await db.query(
      `UPDATE police_profiles SET official_id = $1, station = $2, police_rank = $3, badge_number = $4 WHERE user_id = $5`,
      [police_id, station, police_rank, badge_number, req.params.id]
    );
    res.json({ success: true, message: 'Police officer updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to update police officer' });
  }
};

const updatePoliceStatus = async (req, res) => {
  try {
    const active = req.body.status === 'Active' ? true : req.body.status === 'Inactive' ? false : null;
    if (active === null) return res.status(400).json({ success: false, message: 'Status must be Active or Inactive' });
    const [r] = await db.query(`UPDATE users SET active = $1 WHERE id = $2 AND role = 'POLICE'`, [active, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Police officer not found' });
    res.json({ success: true, message: `Police officer ${req.body.status.toLowerCase()} successfully` });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update police status' });
  }
};

const deletePolice = async (req, res) => {
  try {
    const [r] = await db.query(`DELETE FROM users WHERE id = $1 AND role = 'POLICE'`, [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Police officer not found' });
    res.json({ success: true, message: 'Police officer deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to delete police officer' });
  }
};

const policeLogin = async (req, res) =>
  res.status(410).json({ success: false, message: 'Police login is handled by the main MCRN authentication service.' });

module.exports = { getAllPolice, getPoliceById, addPolice, updatePolice, updatePoliceStatus, deletePolice, policeLogin };
