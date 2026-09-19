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
        full_name: user.full_name || '',
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
      `SELECT id, username, email, full_name, role, created_at FROM users WHERE id = $1`,
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

// PUT /api/auth/profile - Update user profile and/or change password
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, username, email, current_password, new_password } = req.body;

    // 1. Fetch current user
    const userRes = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const currentUser = userRes.rows[0];

    // 2. Check username collision if changed
    const targetUsername = username ? username.trim() : currentUser.username;
    if (targetUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
      const existingUsername = await query(
        `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2`,
        [targetUsername, userId]
      );
      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ error: 'Username is already taken by another account.' });
      }
    }

    // 3. Check email collision if changed
    const targetEmail = email ? email.trim() : currentUser.email;
    if (targetEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingEmail = await query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2`,
        [targetEmail, userId]
      );
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already registered to another account.' });
      }
    }

    // 4. Handle password change if requested
    let targetPasswordHash = currentUser.password_hash;
    let passwordChanged = false;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const match = await bcrypt.compare(current_password, currentUser.password_hash);
      if (!match) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }
      targetPasswordHash = await bcrypt.hash(new_password, 10);
      passwordChanged = true;
    }

    const targetFullName = full_name !== undefined ? full_name.trim() : (currentUser.full_name || '');

    // 5. Update user in database
    if (passwordChanged) {
      await query(
        `UPDATE users SET full_name = $1, username = $2, email = $3, password_hash = $4 WHERE id = $5`,
        [targetFullName, targetUsername, targetEmail, targetPasswordHash, userId]
      );
    } else {
      await query(
        `UPDATE users SET full_name = $1, username = $2, email = $3 WHERE id = $4`,
        [targetFullName, targetUsername, targetEmail, userId]
      );
    }

    // 6. Audit log
    await query(`
      INSERT INTO audit_logs (id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
    `, [
      `log-${Date.now()}`,
      userId,
      passwordChanged ? 'USER_PASSWORD_CHANGE' : 'USER_PROFILE_UPDATE',
      JSON.stringify({ username: targetUsername, email: targetEmail, passwordChanged })
    ]);

    // 7. Generate updated token and response
    const updatedUser = {
      id: currentUser.id,
      username: targetUsername,
      email: targetEmail,
      full_name: targetFullName,
      role: currentUser.role
    };
    const token = generateToken(updatedUser);

    res.json({
      message: passwordChanged ? 'Profile and password updated successfully.' : 'Profile updated successfully.',
      user: updatedUser,
      token
    });
  } catch (err) {
    console.error('[Auth] Profile update error:', err);
    res.status(500).json({ error: 'An unexpected error occurred while updating profile.' });
  }
});

export default router;
