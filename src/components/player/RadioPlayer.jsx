import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useStation } from '../../context/StationContext';

export function RadioPlayer({ variant = 'hero' }) {
  const {
    station,
    branding,
    streams,
    activeStream,
    setActiveStream,
    isPlaying,
    playerStatus,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    togglePlay,
    retryPlayback,
    nowOnAir
  } = useStation();

  const [streamDropdownOpen, setStreamDropdownOpen] = useState(false);

  if (!activeStream) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>No active radio streams are currently configured for this station.</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ${
        variant === 'hero'
          ? 'p-6 sm:p-8 rounded-3xl bg-[var(--surface-color)] border border-slate-200/80 shadow-xl'
          : 'p-4 rounded-2xl bg-[var(--surface-color)] border border-slate-200 shadow-md'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Station Info & On-Air */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-shrink-0">
            {branding?.logo_url ? (
              <img
                src={branding.logo_url}
                alt={station?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm ring-2 ring-white"
              />
            ) : (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm"
                style={{ backgroundColor: branding?.primary_color || '#4F46E5' }}
              >
                <Radio className="w-8 h-8" />
              </div>
            )}
            
            {/* Live Indicator Dot */}
            {isPlaying && playerStatus === 'live' && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 animate-live-badge">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                {playerStatus === 'connecting' ? 'CONNECTING...' : playerStatus === 'live' ? 'LIVE ON AIR' : 'BROADCAST'}
              </span>

              {/* Multi-Stream Switcher */}
              {streams.length > 1 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStreamDropdownOpen(!streamDropdownOpen)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 hover:bg-slate-300 text-slate-800 transition-colors"
                  >
                    <span>{activeStream.name}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {streamDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Available Streams
                      </div>
                      {streams.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setActiveStream(st);
                            setStreamDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-100 transition-colors ${
                            st.id === activeStream.id ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span>{st.name}</span>
                          {st.is_default && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">Default</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <h3 className="font-extrabold text-lg sm:text-xl text-[var(--text-color)] truncate">
              {station?.name || 'Radio Station'}
            </h3>
            
            <p className="text-xs sm:text-sm text-[var(--muted-color)] truncate">
              {nowOnAir ? (
                <>Now: <strong className="text-[var(--text-color)]">{nowOnAir.title}</strong> with {nowOnAir.presenter}</>
              ) : (
                station?.slogan || 'Your favorite station'
              )}
            </p>
          </div>
        </div>

        {/* Center: Play / Pause & Wave Animation */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          {/* Animated Audio Wave Visualizer */}
          {isPlaying && playerStatus === 'live' && (
            <div className="hidden sm:flex items-center gap-1 h-8 w-12 px-1">
              <span className="wave-bar w-1.5 bg-[var(--primary-color)] rounded-full h-3"></span>
              <span className="wave-bar w-1.5 bg-[var(--primary-color)] rounded-full h-6"></span>
              <span className="wave-bar w-1.5 bg-[var(--primary-color)] rounded-full h-8"></span>
              <span className="wave-bar w-1.5 bg-[var(--primary-color)] rounded-full h-5"></span>
              <span className="wave-bar w-1.5 bg-[var(--primary-color)] rounded-full h-4"></span>
            </div>
          )}

          {playerStatus === 'error' ? (
            <button
              onClick={retryPlayback}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
            >
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Stream Unavailable — Retry</span>
            </button>
          ) : (
            <button
              onClick={togglePlay}
              disabled={playerStatus === 'connecting'}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-white text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:scale-95"
              style={{
                backgroundColor: branding?.primary_color || '#4F46E5',
              }}
            >
              {playerStatus === 'connecting' ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin text-white" />
                  <span>Connecting...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-6 h-6 fill-current text-white" />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current text-white ml-0.5" />
                  <span>PLAY LIVE</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Volume Controls */}
        <div className="flex items-center gap-3 w-full md:w-44 justify-end">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl hover:bg-slate-200/60 text-slate-700 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 sm:w-28 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>

      </div>
    </div>
  );
}
