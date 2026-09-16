import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Radio, Eye, Newspaper, AlertTriangle, Play, Pause, Activity, TrendingUp } from 'lucide-react';
import { api } from '../../api/client';

export function AnalyticsPage() {
  const { activeAdminStation } = useAuth();
  const stationId = activeAdminStation?.id;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!stationId) return;
      setLoading(true);
      try {
        const data = await api.get(`/stations/${stationId}/analytics/stats`);
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [stationId]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading analytics metrics...</div>;
  }

  const maxPlay = stats?.timeline ? Math.max(...stats.timeline.map(t => t.plays), 1) : 50;
  const maxViews = stats?.timeline ? Math.max(...stats.timeline.map(t => t.pageviews), 1) : 100;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Station Analytics & Telemetry</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time measurement of stream connections, listener play/pause actions, page impressions, and news reader engagement.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Stream Plays</span>
            <Play className="w-4 h-4 fill-current" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalPlays || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Player starts recorded</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Page Views</span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalPageviews || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Public visits</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">News Article Reads</span>
            <Newspaper className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalNewsViews || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Across {stats?.totalArticles || 0} published articles</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Stream Errors</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalErrors || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">Client connection fallbacks</span>
        </div>
      </div>

      {/* Visual Chart: 7-Day Activity Trends */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>7-Day Activity Breakdown (Plays vs Pageviews)</span>
            </h2>
            <p className="text-xs text-slate-400">Comparing listener audio playback to website visitors</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span className="text-slate-600">Plays</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-400"></span>
              <span className="text-slate-600">Pageviews</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-6 pt-6 pb-2 items-end h-64 border-b border-slate-100">
          {stats?.timeline?.map((item, idx) => {
            const playHeight = Math.max(15, Math.round((item.plays / maxPlay) * 180));
            const viewHeight = Math.max(20, Math.round((item.pageviews / maxViews) * 180));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="flex items-end gap-1.5 w-full justify-center">
                  <div
                    style={{ height: `${playHeight}px` }}
                    className="w-3 sm:w-6 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500 shadow-xs"
                    title={`${item.day}: ${item.plays} Plays`}
                  />
                  <div
                    style={{ height: `${viewHeight}px` }}
                    className="w-3 sm:w-6 bg-sky-400 rounded-t-lg transition-all group-hover:bg-sky-300 shadow-xs"
                    title={`${item.day}: ${item.pageviews} Pageviews`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500 mt-2">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
