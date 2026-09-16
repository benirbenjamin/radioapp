import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, verifyStationAccess } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stations/:stationId/settings
router.get('/:stationId/settings', async (req, res) => {
  try {
    const { stationId } = req.params;

    const [settingsRes, stationRes] = await Promise.all([
      query(`SELECT * FROM station_settings WHERE station_id = $1`, [stationId]),
      query(`SELECT id, name, slug, slogan, description, status FROM radio_stations WHERE id = $1`, [stationId])
    ]);

    if (stationRes.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found.' });
    }

    const station = stationRes.rows[0];
    const settings = settingsRes.rows[0] || {};

    res.json({
      ...settings,
      station_name: station.name,
      station_slug: station.slug,
      station_slogan: station.slogan,
      station_description: station.description,
      station_status: station.status
    });
  } catch (err) {
    console.error('[Settings] Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch station settings.' });
  }
});

// PUT /api/stations/:stationId/settings
router.put('/:stationId/settings', authenticateToken, verifyStationAccess, async (req, res) => {
  try {
    const { stationId } = req.params;
    const {
      station_name,
      station_slogan,
      station_description,
      phone,
      email,
      address,
      website,
      facebook,
      instagram,
      twitter,
      youtube,
      tiktok,
      whatsapp,
      copyright_text,
      timezone,
      language,
      seo_title,
      seo_description,
      seo_keywords
    } = req.body;

    // Update station base info
    if (station_name || station_slogan !== undefined || station_description !== undefined) {
      await query(`
        UPDATE radio_stations
        SET name = COALESCE($1, name),
            slogan = COALESCE($2, slogan),
            description = COALESCE($3, description),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [station_name ? station_name.trim() : null, station_slogan, station_description, stationId]);
    }

    // Update settings
    await query(`
      UPDATE station_settings
      SET phone = $1, email = $2, address = $3, website = $4,
          facebook = $5, instagram = $6, twitter = $7, youtube = $8,
          tiktok = $9, whatsapp = $10, copyright_text = $11, timezone = $12,
          language = $13, seo_title = $14, seo_description = $15, seo_keywords = $16,
          updated_at = CURRENT_TIMESTAMP
      WHERE station_id = $17
    `, [
      phone || null,
      email || null,
      address || null,
      website || null,
      facebook || null,
      instagram || null,
      twitter || null,
      youtube || null,
      tiktok || null,
      whatsapp || null,
      copyright_text || null,
      timezone || 'Africa/Kigali',
      language || 'en',
      seo_title || null,
      seo_description || null,
      seo_keywords || null,
      stationId
    ]);

    res.json({ message: 'Station settings updated successfully.' });
  } catch (err) {
    console.error('[Settings] Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update station settings.' });
  }
});

export default router;
