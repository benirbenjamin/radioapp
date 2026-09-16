import express from 'express';
import { query } from '../config/db.js';
import { calculateOnAirPrograms } from '../utils/scheduleHelper.js';

const router = express.Router();

// GET /api/stations - List all active stations
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT rs.*, sb.logo_url, sb.theme, sb.primary_color, sb.secondary_color
      FROM radio_stations rs
      LEFT JOIN station_branding sb ON rs.id = sb.station_id
      WHERE rs.status = 'active'
      ORDER BY rs.is_default DESC, rs.name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('[Stations] Error listing stations:', err);
    res.status(500).json({ error: 'Failed to fetch radio stations.' });
  }
});

// GET /api/stations/:slug - Get full station public bundle
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Fetch station record
    const stationRes = await query(`
      SELECT * FROM radio_stations WHERE slug = $1 AND status = 'active'
    `, [slug]);

    if (stationRes.rows.length === 0) {
      return res.status(404).json({ error: 'Radio station not found or inactive.' });
    }

    const station = stationRes.rows[0];
    const stationId = station.id;

    // 2. Fetch branding
    const brandingRes = await query(`SELECT * FROM station_branding WHERE station_id = $1`, [stationId]);
    const branding = brandingRes.rows[0] || {};

    // 3. Fetch active streams
    const streamsRes = await query(`
      SELECT * FROM radio_streams 
      WHERE station_id = $1 AND status = 'active' 
      ORDER BY is_default DESC, created_at ASC
    `, [stationId]);

    // 4. Fetch programs
    const programsRes = await query(`
      SELECT * FROM programs 
      WHERE station_id = $1 AND status = 'active' 
      ORDER BY start_time ASC
    `, [stationId]);

    // 5. Fetch station settings & timezone
    const settingsRes = await query(`SELECT * FROM station_settings WHERE station_id = $1`, [stationId]);
    const settings = settingsRes.rows[0] || {};

    // 6. Calculate Now On Air & Coming Next
    const { nowOnAir, comingNext } = calculateOnAirPrograms(programsRes.rows, settings.timezone || 'Africa/Kigali');

    // 7. Fetch latest published news (limit 6 for homepage)
    const newsRes = await query(`
      SELECT na.id, na.title, na.slug, na.excerpt, na.image_url, na.published_at, na.views_count,
             nc.name as category_name, nc.slug as category_slug
      FROM news_articles na
      LEFT JOIN news_categories nc ON na.category_id = nc.id
      WHERE na.station_id = $1 AND na.status = 'published'
      ORDER BY na.published_at DESC
      LIMIT 6
    `, [stationId]);

    // 8. Fetch active YouTube videos (limit 4 for homepage)
    const videosRes = await query(`
      SELECT * FROM videos 
      WHERE station_id = $1 AND status = 'active' AND show_on_homepage = true
      ORDER BY created_at DESC
      LIMIT 6
    `, [stationId]);

    // 9. Fetch homepage sections configuration
    const sectionsRes = await query(`SELECT * FROM homepage_sections WHERE station_id = $1`, [stationId]);
    const sections = sectionsRes.rows[0] || {
      player_enabled: true,
      on_air_enabled: true,
      programs_enabled: true,
      news_enabled: true,
      videos_enabled: true,
      about_enabled: true,
      social_enabled: true,
      contact_enabled: true
    };

    // Log pageview event (async, non-blocking)
    query(`
      INSERT INTO analytics_events (id, station_id, event_type, event_data)
      VALUES ($1, $2, 'pageview', $3)
    `, [`evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, stationId, JSON.stringify({ slug, path: `/station/${slug}` })]).catch(() => {});

    res.json({
      station,
      branding,
      streams: streamsRes.rows,
      programs: programsRes.rows,
      nowOnAir,
      comingNext,
      news: newsRes.rows,
      videos: videosRes.rows,
      sections,
      settings
    });
  } catch (err) {
    console.error('[Stations] Error loading station bundle:', err);
    res.status(500).json({ error: 'Failed to retrieve station details.' });
  }
});

// GET /api/stations/id/:stationId - Get station by ID for admin
router.get('/id/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const result = await query(`SELECT * FROM radio_stations WHERE id = $1`, [stationId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Stations] Error fetching station by ID:', err);
    res.status(500).json({ error: 'Failed to fetch station.' });
  }
});

export default router;
