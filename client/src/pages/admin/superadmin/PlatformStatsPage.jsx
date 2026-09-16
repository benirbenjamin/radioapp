import React, { useState, useEffect } from 'react';
import { BarChart3, Building2, Radio, Users, Newspaper, Activity, ShieldCheck, Globe } from 'lucide-react';
import { api } from '../../../api/client';

export function PlatformStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get('/superadmin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load superadmin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading global platform metrics...</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Platform-Level Statistics</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Global metrics across all deployed radio stations, audio streaming relays, and administrators.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Stations</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalStations || 0}</p>
          <span className="text-[11px] text-emerald-600 font-bold">{stats?.activeStations || 0} active & broadcasting</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Streams</span>
            <Radio className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalStreams || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">{stats?.activeStreams || 0} active channels</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Station Admins</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalAdmins || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Assigned operators</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Published Articles</span>
            <Newspaper className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalPublishedArticles || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Across all frequencies</span>
        </div>
      </div>

      {/* Global Activity Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Global Platform Telemetry</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The platform engine has captured <strong className="text-slate-900 font-bold">{stats?.totalPlatformEvents || 0} total telemetry events</strong> (including audio play/pauses, connection handshakes, stream health events, and pageview impressions) across all configured stations.
        </p>
      </div>

    </div>
  );
}
