import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaCross } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const LiturgicalCalendar = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await axios.get('http://calapi.inadiutorium.cz/api/v0/en/calendars/default/today');
        setCalendarData(response.data);
      } catch (err) {
        setError('Failed to load liturgical data for today. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
        <PulseLoader color="#3b82f6" size={14} margin={6} speedMultiplier={0.7} />
        <p className="text-blue-500 text-[10px] mt-6 font-bold uppercase tracking-[0.3em] animate-pulse">Consulting Ordo...</p>
      </div>
    );
  }

  const colorMap = {
    green: { bg: '#166534', text: '#fff' },
    red: { bg: '#991b1b', text: '#fff' },
    white: { bg: '#f8fafc', text: '#000' },
    violet: { bg: '#5b21b6', text: '#fff' },
    rose: { bg: '#be185d', text: '#fff' },
    black: { bg: '#000000', text: '#fff' }
  };

  const vestmentColor = calendarData?.celebrations[0]?.colour || 'green';
  const style = colorMap[vestmentColor] || colorMap.green;

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-serif text-[#d2b48c] mb-6">Liturgical Calendar</h2>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
          <div className="w-12 h-12 rounded-full bg-blue-900/20 border border-blue-900/50 flex items-center justify-center shrink-0">
            <FaCalendarAlt className="text-blue-500" size={20} />
          </div>
          <div>
            <h3 className="text-white font-serif text-xl">Today's Liturgy</h3>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">{new Date().toDateString()}</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        {calendarData && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><FaCross size={100} /></div>
              <h4 className="text-2xl font-serif text-white mb-2">{calendarData.celebrations[0]?.title || 'Ordinary Time'}</h4>
              <p className="text-sm text-gray-400 mb-6 capitalize">{calendarData.season} Season • Week {calendarData.season_week}</p>
              
              <div className="flex items-center gap-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Vestment Color:</p>
                <span 
                  className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest shadow-md border border-[#3d2b1f]" 
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {vestmentColor}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiturgicalCalendar;