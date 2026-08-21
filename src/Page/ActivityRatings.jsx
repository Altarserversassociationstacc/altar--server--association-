import React, { useState } from 'react';
import { 
  FaCheck, FaTimes, FaCalendarAlt, FaChevronLeft, 
  FaChevronRight, FaChurch, FaUsers, FaTshirt, 
  FaFilter, FaUndo, FaChartBar
} from 'react-icons/fa';

const ActivityRatings = ({ 
  allMeetings = [], 
  currentUser, 
  onBackToDashboard
}) => {

  // 🎛️ DYNAMIC FILTERS
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedType, setSelectedType] = useState('All'); 

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
  const liveLogs = (allMeetings || []).map(meeting => {
    let derivedType = meeting.type;
    
    if (meeting.title) {
      const exactTitle = meeting.title.trim().toLowerCase();
      if (exactTitle === 'practice') {
        derivedType = 'Practice';
      } else if (exactTitle === 'cloth washing') {
        derivedType = 'Cloth Washing';
      }
    }

    if (!derivedType) {
      derivedType = 'Meeting';
    }

    const rawDate = meeting.eventDate || meeting.date;
    const formattedDateString = meeting.dateString || (rawDate ? new Date(rawDate).toDateString() : 'Unknown Date');

    return {
      title: meeting.title,
      date: rawDate,
      displayDate: formattedDateString, 
      semester: meeting.semester,
      level: meeting.level || 'All Levels',
      type: derivedType, 
      attended: meeting.attended
    };
  });

  // 🟢 FILTER LOGIC 
  const filteredLogs = liveLogs.filter((session) => {
    const matchSemester = selectedSemester === 'All' || session.semester === selectedSemester;
    const matchLevel = selectedLevel === 'All' || session.level === selectedLevel;
    const matchType = selectedType === 'All' || session.type === selectedType;
    return matchSemester && matchLevel && matchType;
  });

  // 📈 OVERALL PERCENTAGE CALCULATIONS
  const totalFilteredCount = filteredLogs.length;
  const attendedFilteredCount = filteredLogs.filter(log => log.attended).length;
  const calculatedPercent = totalFilteredCount > 0 ? Math.round((attendedFilteredCount / totalFilteredCount) * 100) : 0;

  const dynamicStanding = totalFilteredCount === 0 ? 'No Logs Found' : 
                          calculatedPercent >= 75 ? 'Excellent Standing' : 
                          calculatedPercent >= 50 ? 'Good Standing' : 'Review Required';

  const getStandingColor = (percent) => {
    if (percent >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (percent >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  // 👤 OPERATIONAL BREAKDOWN BY ACTIVITY TYPE
  const getTypeStats = (type) => {
    const typeLogs = filteredLogs.filter(log => log.type === type);
    const total = typeLogs.length;
    const attended = typeLogs.filter(log => log.attended).length;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, attended, missed: total - attended, rate };
  };

  const meetingStats = getTypeStats('Meeting');
  const practiceStats = getTypeStats('Practice');
  const workStats = getTypeStats('Cloth Washing');

  // 📆 CALENDAR GRID CALCULATIONS
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

  const getLogsForDate = (dateStr) => {
    return filteredLogs.filter(log => {
      if (!log.date) return false; 
      const logDateObj = new Date(log.date);
      if (isNaN(logDateObj.getTime())) return false;

      const yy = logDateObj.getFullYear();
      const mm = String(logDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(logDateObj.getDate()).padStart(2, '0');
      
      return `${yy}-${mm}-${dd}` === dateStr;
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

  const displayLogs = selectedDateString 
    ? activeLogs 
    : [...filteredLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const renderActivityIcon = (type) => {
    switch (type) {
      case 'Practice': return <FaUsers size={11} />;
      case 'Cloth Washing': return <FaTshirt size={11} />;
      case 'Meeting': default: return <FaChurch size={11} />;
    }
  };

  const getActivityBadgeStyle = (type) => {
    switch (type) {
      case 'Practice': return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
      case 'Cloth Washing': return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'Meeting': default: return 'bg-sky-950/60 text-sky-300 border-sky-800/40';
    }
  };

  return (
    <div className="animate-fadeIn font-sans text-neutral-100 pb-16 w-full space-y-8 max-w-6xl mx-auto px-4 sm:px-6">

      {/* 👤 BANNER & BREAKDOWN HEADER */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d2b48c]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-[#d2b48c]/10 text-[#d2b48c] border border-[#d2b48c]/20 rounded-lg">
                <FaChartBar size={14} />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d2b48c]">Participation Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Activity & Attendance Summary
            </h1>
          </div>

          {currentUser && (
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d2b48c]/20 text-[#d2b48c] border border-[#d2b48c]/40 flex items-center justify-center font-bold text-xs uppercase">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">{currentUser.name || 'Member'}</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{currentUser.matricNo || currentUser.level || 'Active Record'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown Cards with Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 relative z-10">
          
          {/* Meetings */}
          <div className="bg-sky-950/20 border border-sky-800/30 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-700/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-2">
                <FaChurch size={12} /> Meetings
              </span>
              <span className="text-sm font-mono font-black text-sky-300">{meetingStats.rate}%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${meetingStats.rate}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                <span className="text-white font-bold">{meetingStats.attended}</span> / {meetingStats.total} Attended
              </p>
            </div>
          </div>

          {/* Practices */}
          <div className="bg-purple-950/20 border border-purple-800/30 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-700/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <FaUsers size={12} /> Practices
              </span>
              <span className="text-sm font-mono font-black text-purple-300">{practiceStats.rate}%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full transition-all duration-500" style={{ width: `${practiceStats.rate}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                <span className="text-white font-bold">{practiceStats.attended}</span> / {practiceStats.total} Attended
              </p>
            </div>
          </div>

          {/* Saturday Work */}
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-700/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <FaTshirt size={12} /> Saturday Work
              </span>
              <span className="text-sm font-mono font-black text-amber-300">{workStats.rate}%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${workStats.rate}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                <span className="text-white font-bold">{workStats.attended}</span> / {workStats.total} Attended
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 🏛️ CONTROL BANNER & FILTERS */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
        
        {/* Radial Metric Ring */}
        <div className="flex items-center gap-6 lg:pr-8 lg:border-r border-white/10">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={calculatedPercent >= 50 ? "text-emerald-500" : "text-rose-500"}
                strokeDasharray={`${calculatedPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-base font-mono font-black text-white">{calculatedPercent}%</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Filtered Rating</span>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Overall Participation</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-bold text-gray-300">
                <span className="text-[#d2b48c]">{attendedFilteredCount}</span> of {totalFilteredCount} Sessions
              </span>
              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStandingColor(calculatedPercent)}`}>
                {dynamicStanding}
              </span>
            </div>
          </div>
        </div>

        {/* 🎛️ FILTERS CONTAINER */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-end flex-1">
          
          <div className="w-full sm:w-auto flex-1">
            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 flex items-center gap-1.5">
              <FaFilter size={9} className="text-[#d2b48c]" /> Activity Type
            </label>
            <select 
              value={selectedType} 
              onChange={(e) => { setSelectedType(e.target.value); setSelectedDateString(null); }} 
              className="w-full bg-[#1a1a1e] border border-white/10 hover:border-white/20 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#d2b48c] transition-all cursor-pointer"
            >
              <option value="All">All Activities</option>
              <option value="Meeting">Meeting</option>
              <option value="Practice">Practice</option>
              <option value="Cloth Washing">Saturday Work</option>
            </select>
          </div>

          <div className="w-full sm:w-auto flex-1">
            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Semester</label>
            <select 
              value={selectedSemester} 
              onChange={(e) => { setSelectedSemester(e.target.value); setSelectedDateString(null); }} 
              className="w-full bg-[#1a1a1e] border border-white/10 hover:border-white/20 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#d2b48c] transition-all cursor-pointer"
            >
              <option value="All">All Semesters</option>
              <option value="Harmattan Semester">Harmattan</option>
              <option value="Rain Semester">Rain</option>
            </select>
          </div>

          <div className="w-full sm:w-auto flex-1">
            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Level</label>
            <select 
              value={selectedLevel} 
              onChange={(e) => { setSelectedLevel(e.target.value); setSelectedDateString(null); }} 
              className="w-full bg-[#1a1a1e] border border-white/10 hover:border-white/20 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#d2b48c] transition-all cursor-pointer"
            >
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

      {/* 📊 INTERACTIVE CALENDAR */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={prevMonth} 
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[#d2b48c] border border-white/10 hover:border-white/20"
            >
              <FaChevronLeft size={11} />
            </button>
            <div className="flex items-center gap-2">
              <select 
                value={currentMonth} 
                onChange={(e) => { setCurrentMonth(parseInt(e.target.value)); setSelectedDateString(null); }} 
                className="bg-[#1a1a1e] border border-white/10 rounded-xl py-2 px-3 text-xs font-extrabold uppercase tracking-wider text-[#d2b48c] cursor-pointer outline-none focus:border-[#d2b48c]"
              >
                {MONTHS.map((m, index) => <option className="bg-[#121214] text-white" key={m} value={index}>{m}</option>)}
              </select>
              <select 
                value={currentYear} 
                onChange={(e) => { setCurrentYear(parseInt(e.target.value)); setSelectedDateString(null); }} 
                className="bg-[#1a1a1e] border border-white/10 rounded-xl py-2 px-3 text-xs font-extrabold tracking-wider text-white cursor-pointer outline-none focus:border-[#d2b48c]"
              >
                {YEAR_DROPDOWN_OPTIONS.map(yr => <option className="bg-[#121214] text-white" key={yr} value={yr}>{yr}</option>)}
              </select>
            </div>
            <button 
              onClick={nextMonth} 
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[#d2b48c] border border-white/10 hover:border-white/20"
            >
              <FaChevronRight size={11} />
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <h3 className="text-sm font-black tracking-widest uppercase text-gray-300">
              {MONTHS[currentMonth]} <span className="text-[#d2b48c]">{currentYear}</span>
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Select a date with logs to filter</p>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {DAYS_SHORT.map(d => (
            <span key={d} className="text-[10px] font-black uppercase text-gray-400 tracking-widest py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
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
                disabled={!hasLogs}
                className={`aspect-square rounded-2xl border flex flex-col justify-between p-2 relative transition-all duration-200 outline-none ${
                  !hasLogs 
                    ? 'border-white/5 bg-white/[0.01] opacity-25 cursor-not-allowed' 
                    : isSelected
                      ? 'border-[#d2b48c] bg-[#d2b48c]/20 shadow-lg shadow-[#d2b48c]/10 scale-95 ring-1 ring-[#d2b48c]'
                      : 'border-white/10 bg-white/5 hover:border-[#d2b48c]/60 hover:bg-white/10 cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className={`text-xs sm:text-sm font-black ${isSelected ? 'text-[#d2b48c]' : hasLogs ? 'text-white' : 'text-gray-600'}`}>
                    {day}
                  </span>
                  {hasLogs && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d2b48c] animate-pulse"></span>
                  )}
                </div>
                
                {hasLogs && (
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md self-end block text-center uppercase tracking-tight ${
                    isSelected ? 'bg-[#d2b48c] text-black font-black' : 'bg-white/10 text-gray-300 border border-white/10'
                  }`}>
                    {dayLogs.length} {dayLogs.length === 1 ? 'LOG' : 'LOGS'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🖥️ DRILL-DOWN / RECENT ACTIVITY LOGS */}
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#d2b48c]/10 border border-[#d2b48c]/20 rounded-2xl text-[#d2b48c]">
              <FaCalendarAlt size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                {selectedDateString ? `Activity Logs for ${selectedDateString}` : 'Recent Filtered Activity Logs'}
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                {selectedDateString 
                  ? `Showing records logged on ${selectedDateString}` 
                  : 'Displaying latest activity sessions matching active filters'}
              </p>
            </div>
          </div>

          {selectedDateString && (
            <button 
              onClick={() => setSelectedDateString(null)} 
              className="flex items-center gap-2 text-xs font-bold text-[#d2b48c] bg-[#d2b48c]/10 border border-[#d2b48c]/20 px-3.5 py-2 rounded-xl hover:bg-[#d2b48c]/20 transition-all self-start sm:self-auto cursor-pointer"
            >
              <FaUndo size={10} /> Clear Date Selection
            </button>
          )}
        </div>

        {/* Logs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayLogs.length > 0 ? (
            displayLogs.map((session, index) => (
              <div 
                key={index} 
                className={`border p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 bg-gradient-to-b ${
                  session.attended 
                    ? 'border-emerald-500/20 from-emerald-950/10 via-[#16161a] to-[#121214] hover:border-emerald-500/40' 
                    : 'border-rose-500/20 from-rose-950/10 via-[#16161a] to-[#121214] hover:border-rose-500/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5 border ${getActivityBadgeStyle(session.type)}`}>
                      {renderActivityIcon(session.type)} {session.type}
                    </span>

                    {session.attended ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <FaCheck size={9} /> Attended
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-400 uppercase bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                        <FaTimes size={9} /> Missed
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide">{session.title}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{session.displayDate}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 mt-5 pt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  <span className="text-[#d2b48c] font-extrabold">{session.semester}</span>
                  <span className="bg-white/5 px-2.5 py-1 rounded-md text-gray-300 border border-white/10 font-bold">
                    {session.level || 'All Levels'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-12 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-400 font-bold text-sm tracking-wide">No activity logs match your selected filter criteria.</p>
              <p className="text-xs text-gray-600 mt-1">Try switching semester, level, or activity type dropdowns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityRatings;