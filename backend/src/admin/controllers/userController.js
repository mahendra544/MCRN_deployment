const bcrypt = require('bcryptjs');
const db = require('../../db');

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name, email, phone, active, created_at FROM users WHERE role='USER' ORDER BY id DESC`);
    res.json({
      success: true,
      users: (rows || []).map(u => ({ ...u, status: u.active ? 'Active' : 'Inactive' }))
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name, email, phone, active, created_at FROM users WHERE id = $1 AND role='USER'`, [req.params.id]);
    if (!rows || !rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      user: { ...rows[0], status: rows[0].active ? 'Active' : 'Inactive' }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    const [exists] = await db.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (exists && exists.length) return res.status(409).json({ success: false, message: 'Email already exists' });
    const username = (email.split('@')[0] + '_' + Date.now().toString().slice(-4)).slice(0, 50);
    const hash = await bcrypt.hash(password, 12);
    const [r] = await db.query(
      `INSERT INTO users (username, name, email, password_hash, role, verified, active, phone) VALUES ($1, $2, $3, $4, 'USER', true, true, $5)`,
      [username, name, email, hash, phone || null]
    );
    res.status(201).json({ success: true, message: 'User added successfully', userId: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to add user' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const active = req.body.status === 'Active' ? true : req.body.status === 'Inactive' ? false : null;
    if (active === null) return res.status(400).json({ success: false, message: 'Status must be Active or Inactive' });
    const [r] = await db.query(`UPDATE users SET active = $1 WHERE id = $2 AND role='USER'`, [active, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User status changed to ${req.body.status}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

module.exports = { getUsers, getUserById, addUser, updateUserStatus };
