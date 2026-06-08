import React, { useState } from 'react';
import { 
  FaCheckSquare, FaTimes, FaArrowRight, 
  FaTachometerAlt, FaCalendarDay, FaFilter,
  FaChevronLeft, FaChevronRight, FaChurch, FaUsers
} from 'react-icons/fa';

const ActivityRatings = ({ 
  allMeetings, // <--- Accept the new prop here
  currentUser, 
  onBackToDashboard
}) => {
  // 🎛️ DYNAMIC FILTERS
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // 📆 CALENDAR ENGINE STATE
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDateString, setSelectedDateString] = useState(null);

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startingYear = new Date().getFullYear() - 3;
  const YEAR_DROPDOWN_OPTIONS = Array.from({ length: 8 }, (_, i) => startingYear + i);

  // =================================================================
  // 🔌 DATABASE INJECTION & FORMATTING
  // =================================================================
  console.log("1. Raw Data from Database:", allMeetings);
console.log("2. Current User ID:", currentUser?._id);
  // Transform your Global Meetings into the format the calendar expects
 // ✅ NEW CODE
  const liveLogs = (allMeetings || []).map(meeting => ({
    title: meeting.title,
    date: meeting.date, // <-- Changed to match the backend!
    semester: meeting.semester,
    level: meeting.level || 'All Levels',
    type: meeting.type || 'Meeting',
    attended: meeting.attended
  }));

  const filteredLogs = liveLogs.filter((session) => {
    const matchSemester = selectedSemester === 'All' || session.semester === selectedSemester;
    const matchLevel = selectedLevel === 'All' || session.level === selectedLevel;
    return matchSemester && matchLevel;
  });

  // ... (The rest of the component stays exactly the same!)

  // 📈 PERCENTAGE & YIELD CALCULATIONS
  const totalFilteredCount = filteredLogs.length;
  const attendedFilteredCount = filteredLogs.filter(log => log.attended).length;
  const calculatedPercent = totalFilteredCount > 0 ? Math.round((attendedFilteredCount / totalFilteredCount) * 100) : 0;

  const dynamicStanding = totalFilteredCount === 0 ? 'No Logs Found' : 
                          calculatedPercent >= 75 ? 'Excellent Standing' : 
                          calculatedPercent >= 50 ? 'Good Standing' : 'Review Required';

  // =================================================================
  // 📅 ROBUST CALENDAR MATRIX LOGIC
  // =================================================================
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) calendarCells.push(null); 
  for (let day = 1; day <= daysInMonth; day++) calendarCells.push(day);

  const formatDateString = (day) => {
    if (!day) return '';
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // 🛡️ TIMEZONE SAFE DATE MATCHING
  const getLogsForDate = (dateStr) => {
    return filteredLogs.filter(log => {
      if (!log.date) return false; 
      
      // Explicitly pull local year, month, and day to prevent UTC shifting
      const logDateObj = new Date(log.date);
      if (isNaN(logDateObj.getTime())) return false; // Prevent invalid date crashes

      const yy = logDateObj.getFullYear();
      const mm = String(logDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(logDateObj.getDate()).padStart(2, '0');
      
      const localLogDateStr = `${yy}-${mm}-${dd}`;
      return localLogDateStr === dateStr;
    });
  };

  const prevMonth = () => {
    setSelectedDateString(null); 
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(prev => prev - 1); } 
    else { setCurrentMonth(prev => prev - 1); }
  };

  const nextMonth = () => {
    setSelectedDateString(null);
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(prev => prev + 1); } 
    else { setCurrentMonth(prev => prev + 1); }
  };

  const activeLogs = selectedDateString ? getLogsForDate(selectedDateString) : [];
  
  return (
    <div className="animate-fadeIn font-sans text-white pb-12 w-full space-y-8">
      
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between border-b-2 border-white/10 pb-6">
        <button onClick={onBackToDashboard} className="text-gray-400 hover:text-[#d2b48c] text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 transition-colors outline-none">
          <FaArrowRight className="rotate-180" /> Dashboard Overview
        </button>
        <span className="text-[9px] font-mono tracking-widest text-[#d2b48c] uppercase font-bold">
          {currentUser?.fullName || 'Sanctuary Member'}
        </span>
      </div>

      {/* 🏛️ TOP ACTION CONTROL BANNER */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
        
        {/* Score Display */}
        <div className="flex-1 flex items-center gap-6 border-r-0 lg:border-r border-white/10 pr-0 lg:pr-6">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center shrink-0 border border-white/5 transition-all duration-500" style={{ background: `conic-gradient(${calculatedPercent >= 50 ? '#10b981' : '#ef4444'} ${calculatedPercent}%, rgba(255,255,255,0.05) 0)` }}>
            <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center absolute shadow-inner text-white font-mono font-black text-sm">
              {calculatedPercent}%
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Attendance Score</h2>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
              <span className="text-[#d2b48c]">{attendedFilteredCount}</span> / {totalFilteredCount} Sessions
            </p>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-2 inline-block border ${calculatedPercent >= 70 ? 'bg-green-950/20 text-green-400 border-green-900/30' : 'bg-red-950/20 text-red-400 border-red-900/30'}`}>
              {dynamicStanding}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-end w-full lg:w-auto">
          <div className="w-full sm:w-auto">
            <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1 pl-1">Semester</label>
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full bg-[#111] border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-[#d2b48c] cursor-pointer">
              <option value="All">All Semesters</option>
              <option value="Harmattan Semester">Harmattan</option>
              <option value="Rain Semester">Rain</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1 pl-1">Level</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full bg-[#111] border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-[#d2b48c] cursor-pointer">
              <option value="All">All Levels</option>
              <option value="100L">100L</option>
              <option value="200L">200L</option>
              <option value="300L">300L</option>
              <option value="400L">400L</option>
              <option value="500L">500L</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 UNIVERSAL INTERACTIVE CALENDAR CONTAINER */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-2xl max-w-3xl mx-auto">
        
        {/* MONTH & YEAR DROPDOWN CONTROL BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-[#d2b48c] outline-none">
              <FaChevronLeft size={12} />
            </button>
            <select value={currentMonth} onChange={(e) => { setCurrentMonth(parseInt(e.target.value)); setSelectedDateString(null); }} className="bg-white/5 border-0 rounded-xl py-2 px-3 text-sm font-black uppercase tracking-wider text-[#d2b48c] cursor-pointer outline-none appearance-none">
              {MONTHS.map((m, index) => <option className="bg-black text-white" key={m} value={index}>{m}</option>)}
            </select>
            <select value={currentYear} onChange={(e) => { setCurrentYear(parseInt(e.target.value)); setSelectedDateString(null); }} className="bg-white/5 border-0 rounded-xl py-2 px-4 text-sm font-black tracking-wider text-white cursor-pointer outline-none appearance-none">
              {YEAR_DROPDOWN_OPTIONS.map(yr => <option className="bg-black text-white" key={yr} value={yr}>{yr}</option>)}
            </select>
            <button onClick={nextMonth} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-[#d2b48c] outline-none">
              <FaChevronRight size={12} />
            </button>
          </div>
          <h3 className="hidden sm:block text-base font-black tracking-widest uppercase text-neutral-400">
            {MONTHS[currentMonth]} <span className="text-[#d2b48c]">{currentYear}</span>
          </h3>
        </div>

        {/* CALENDAR WEEKDAY ROW GRID */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {DAYS_SHORT.map(d => <span key={d} className="text-[11px] font-black uppercase text-gray-500 tracking-wider py-1">{d}</span>)}
        </div>

        {/* SEVEN-COLUMN MATRIX HOLES */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((day, idx) => {
            const dateStr = formatDateString(day);
            const dayLogs = day ? getLogsForDate(dateStr) : [];
            const hasLogs = dayLogs.length > 0;
            const isSelected = selectedDateString === dateStr;

            if (!day) return <div key={`empty-${idx}`} className="aspect-square opacity-0"></div>;

            return (
              <button
                key={`day-${day}`}
                type="button"
                onClick={() => hasLogs && setSelectedDateString(isSelected ? null : dateStr)}
                className={`aspect-square rounded-xl border flex flex-col justify-between p-2 relative transition-all duration-200 outline-none text-left ${
                  !hasLogs 
                    ? 'border-white/5 bg-transparent opacity-30 cursor-not-allowed' 
                    : isSelected
                      ? 'border-[#d2b48c] bg-[#d2b48c]/20 shadow-inner scale-[0.98]'
                      : 'border-white/20 bg-white/5 hover:border-[#d2b48c] cursor-pointer'
                }`}
                disabled={!hasLogs}
              >
                <span className={`text-sm font-black ${isSelected ? 'text-[#d2b48c]' : hasLogs ? 'text-white' : 'text-gray-600'}`}>{day}</span>
                
                {hasLogs && (
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md self-end block text-center uppercase ${
                    isSelected ? 'bg-[#d2b48c] text-black' : 'bg-white/10 text-gray-300'
                  }`}>
                    {dayLogs.length} LOG
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🖥️ DYNAMIC CLIENT DRILL DOWN DETAIL DISPLAY PANELS */}
      {selectedDateString && (
        <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 md:p-8 animate-fadeIn shadow-2xl space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="p-3 bg-[#d2b48c]/10 border border-[#d2b48c]/20 rounded-2xl text-[#d2b48c]">
              <FaCalendarDay size={20} />
            </div>
            <div>
              <h3 className="text-xl font-serif text-white uppercase tracking-wide">Activity Logs: {selectedDateString}</h3>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Displaying user participation on this date</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLogs.map((session, index) => (
              <div key={index} className={`border p-5 rounded-2xl flex flex-col justify-between transition-all bg-gradient-to-b ${
                session.attended ? 'border-emerald-500/30 from-emerald-950/20 to-transparent' : 'border-red-500/30 from-red-950/20 to-transparent'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 w-max ${
                      session.type === 'Mass' ? 'bg-blue-950 text-blue-400 border border-blue-900/30' : 'bg-purple-950 text-purple-400 border border-purple-900/30'
                    }`}>
                      {session.type === 'Mass' ? <FaChurch size={8} /> : <FaUsers size={8} />} {session.type}
                    </span>
                    <h4 className="text-sm font-serif font-bold text-white uppercase mt-2 tracking-wide truncate max-w-[200px]">{session.title}</h4>
                  </div>
                  {session.attended ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg"><FaCheckSquare /> Attended</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg"><FaTimes /> Missed</span>
                  )}
                </div>

                <div className="border-t border-white/5 mt-4 pt-3 flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-gray-400">
                  <span className="text-[#d2b48c] font-bold">{session.semester}</span>
                  <span className="bg-white/5 px-2 py-1 rounded text-gray-300 border border-white/10">{session.level || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Strip */}
      <div className="p-4 bg-black/20 border border-white/5 rounded-2xl flex justify-between items-center max-w-3xl mx-auto mt-8">
        <button type="button" onClick={onBackToDashboard} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest outline-none">
          <FaTachometerAlt size={12} /> Return To Panel
        </button>
      </div>

    </div>
  );
};

export default ActivityRatings;