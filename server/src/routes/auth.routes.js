import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const userResult = await query(
      `SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)`,
      [username.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Fetch assigned stations if stationadmin
    let assignedStations = [];
    if (user.role === 'stationadmin') {
      const stationRes = await query(`
        SELECT rs.* 
        FROM radio_stations rs
        JOIN station_admins sa ON rs.id = sa.station_id
        WHERE sa.user_id = $1
      `, [user.id]);
      assignedStations = stationRes.rows;
    } else if (user.role === 'superadmin') {
      const allStations = await query(`SELECT * FROM radio_stations ORDER BY name ASC`);
      assignedStations = allStations.rows;
    }

    const token = generateToken(user);

    // Audit log
    await query(`
      INSERT INTO audit_logs (id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
    `, [`log-${Date.now()}`, user.id, 'USER_LOGIN', JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] })]);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      assignedStations
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, username, email, role, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];

    // Fetch stations
    let assignedStations = [];
    if (user.role === 'stationadmin') {
      const stationRes = await query(`
        SELECT rs.* 
        FROM radio_stations rs
        JOIN station_admins sa ON rs.id = sa.station_id
        WHERE sa.user_id = $1
      `, [user.id]);
      assignedStations = stationRes.rows;
    } else if (user.role === 'superadmin') {
      const allStations = await query(`SELECT * FROM radio_stations ORDER BY name ASC`);
      assignedStations = allStations.rows;
    }

    res.json({
      user,
      assignedStations
    });
  } catch (err) {
    console.error('[Auth] Me endpoint error:', err);
    res.status(500).json({ error: 'Failed to retrieve authenticated user profile.' });
  }
});

export default router;
