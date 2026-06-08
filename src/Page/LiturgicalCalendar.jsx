import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaCross, FaRedo } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

// Base URL setup for routing to your secure backend proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

// 1. Extracted outside component to prevent memory recreation on every render
const VESTMENT_COLORS = {
  green: { bg: '#166534', text: '#ffffff', border: '#14532d' },
  red: { bg: '#991b1b', text: '#ffffff', border: '#7f1d1d' },
  white: { bg: '#f8fafc', text: '#1e293b', border: '#cbd5e1' }, 
  violet: { bg: '#5b21b6', text: '#ffffff', border: '#4c1d95' },
  rose: { bg: '#be185d', text: '#ffffff', border: '#9d174d' },
  black: { bg: '#171717', text: '#ffffff', border: '#0a0a0a' },
  default: { bg: '#374151', text: '#ffffff', border: '#1f2937' } 
};

const LiturgicalCalendar = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Wrapped in useCallback for clean dependency management
  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 3. 🚀 FIXED: Routed to your local backend proxy to bypass the external API's HTTPS limitations
      const response = await axios.get(`${API_BASE_URL}/api/student/liturgical-today`);
      setCalendarData(response.data);
    } catch (err) {
      console.error("Liturgical API Error:", err.message);
      setError('Unable to retrieve the Ordo for today. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fadeIn" aria-live="polite">
        <PulseLoader color="#8b4513" size={14} margin={6} speedMultiplier={0.7} />
        <p className="text-[#8b4513] dark:text-[#d2b48c] text-[10px] mt-6 font-bold uppercase tracking-[0.3em] animate-pulse">
          Consulting Ordo...
        </p>
      </div>
    );
  }

  // 4. Professional Interactive Error State
  if (error) {
    return (
      <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-6 text-center animate-fadeIn max-w-4xl">
        <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
        <button 
          onClick={fetchCalendar}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
        >
          <FaRedo size={12} /> Retry
        </button>
      </div>
    );
  }

  // 5. Safe data extraction with fallbacks
  const celebration = calendarData?.celebrations?.[0];
  const vestmentColorKey = celebration?.colour?.toLowerCase() || 'green';
  const style = VESTMENT_COLORS[vestmentColorKey] || VESTMENT_COLORS.default;

  return (
    // 6. Semantic HTML structures
    <section className="animate-fadeIn transition-colors duration-500">
      <header>
        <h2 className="text-2xl font-serif text-[#8b4513] dark:text-[#d2b48c] mb-6">Liturgical Calendar</h2>
      </header>

      <article className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-[#e6d5c3] dark:border-white/10 p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl transition-colors">
        <div className="flex items-center gap-3 mb-8 border-b border-[#e6d5c3] dark:border-white/5 pb-6">
          <div className="w-12 h-12 rounded-full bg-[#8b4513]/10 dark:bg-[#d2b48c]/10 border border-[#8b4513]/30 dark:border-[#d2b48c]/30 flex items-center justify-center shrink-0">
            <FaCalendarAlt className="text-[#8b4513] dark:text-[#d2b48c]" size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-serif text-xl">Today's Liturgy</h3>
            <time className="text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-widest mt-1 block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </div>
        </div>

        {calendarData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 border border-[#e6d5c3] dark:border-white/10 rounded-xl p-6 relative overflow-hidden shadow-inner transition-colors group">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 pointer-events-none text-[#8b4513] dark:text-white transform group-hover:scale-110 transition-transform duration-700">
                <FaCross size={140} aria-hidden="true" />
              </div>
              
              <div className="relative z-10">
                <h4 className="text-2xl font-serif text-gray-900 dark:text-white mb-2 leading-tight">
                  {celebration?.title || 'Ordinary Time'}
                </h4>
                
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6 capitalize font-medium">
                  <span>{calendarData.season} Season</span>
                  <span aria-hidden="true">•</span>
                  <span>Week {calendarData.season_week}</span>
                  {celebration?.rank && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>{celebration.rank}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400">
                    Vestment Color:
                  </p>
                  <span 
                    className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest shadow-sm" 
                    style={{ 
                      backgroundColor: style.bg, 
                      color: style.text,
                      border: `1px solid ${style.border}` 
                    }}
                  >
                    {vestmentColorKey}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default LiturgicalCalendar;