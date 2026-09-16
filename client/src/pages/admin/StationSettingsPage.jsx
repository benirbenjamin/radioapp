import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, CheckCircle2, Globe, Phone, Mail, MapPin, Share2, Search } from 'lucide-react';
import { api } from '../../api/client';

export function StationSettingsPage() {
  const { activeAdminStation } = useAuth();
  const stationId = activeAdminStation?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    station_name: '',
    station_slogan: '',
    station_description: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    whatsapp: '',
    copyright_text: '',
    timezone: 'Africa/Kigali',
    language: 'en',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  useEffect(() => {
    async function loadSettings() {
      if (!stationId) return;
      setLoading(true);
      try {
        const data = await api.get(`/stations/${stationId}/settings`);
        setFormData({
          station_name: data.station_name || '',
          station_slogan: data.station_slogan || '',
          station_description: data.station_description || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          website: data.website || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
          youtube: data.youtube || '',
          tiktok: data.tiktok || '',
          whatsapp: data.whatsapp || '',
          copyright_text: data.copyright_text || '',
          timezone: data.timezone || 'Africa/Kigali',
          language: data.language || 'en',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          seo_keywords: data.seo_keywords || '',
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [stationId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put(`/stations/${stationId}/settings`, formData);
      setMessage('Station profile, contact details, and SEO settings saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading station settings...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Station Settings & SEO</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure station profile, contact hotlines, social media profiles, and search engine metadata.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        
        {/* Section 1: General Station Profile */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Station Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Station Name
              </label>
              <input
                type="text"
                required
                value={formData.station_name}
                onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Slogan / Catchphrase
              </label>
              <input
                type="text"
                value={formData.station_slogan}
                onChange={(e) => setFormData({ ...formData, station_slogan: e.target.value })}
                placeholder="e.g. Your Sound, Your Energy, Your Kigali"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Station Description / About Bio
            </label>
            <textarea
              rows={3}
              value={formData.station_description}
              onChange={(e) => setFormData({ ...formData, station_description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Station Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
              >
                <option value="Africa/Kigali">Africa/Kigali (CAT UTC+2)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT UTC+3)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST UTC+2)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Default Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
              >
                <option value="en">English (en)</option>
                <option value="fr">Français (fr)</option>
                <option value="rw">Kinyarwanda (rw)</option>
                <option value="sw">Kiswahili (sw)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Copyright Text
              </label>
              <input
                type="text"
                value={formData.copyright_text}
                onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                placeholder="© 2026 Wave FM. All Rights Reserved."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Studio Contact Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Studio Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number / Studio Hotline
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+250 788 000 000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Studio Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="studio@station.fm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Physical Studio Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Media Tower, Floor 4, City Center"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Primary Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social Media Links */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-600" />
            <span>Social Media Channels</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Facebook URL</label>
              <input
                type="url"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Instagram URL</label>
              <input
                type="url"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">X (Twitter) URL</label>
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">YouTube Channel URL</label>
              <input
                type="url"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="https://youtube.com/@..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">TikTok Profile URL</label>
              <input
                type="url"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+250788123456"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Dynamic Search Engine Optimization (SEO) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600" />
            <span>Search Engine Optimization (SEO) Metadata</span>
          </h2>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Custom Page Meta Title
            </label>
            <input
              type="text"
              value={formData.seo_title}
              onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              placeholder="e.g. Kigali Wave 94.7 FM | The Rhythm of Kigali Live"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={formData.seo_description}
              onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              placeholder="Brief descriptive summary for Google Search and social sharing previews..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Keywords (Comma separated)
            </label>
            <input
              type="text"
              value={formData.seo_keywords}
              onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
              placeholder="radio, live stream, afrobeats, music, news, podcasts"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

      </form>

    </div>
  );
}
