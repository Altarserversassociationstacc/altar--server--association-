import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, FaSearch, FaCalendarDay, 
  FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const MassSelection = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🛡️ DYNAMIC FILTERS
  const [searchName, setSearchName] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  
  // 📆 UNRESTRICTED DYNAMIC CALENDAR ENGINE STATE
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0 - 11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Fully dynamic year initialization
  const [selectedDateString, setSelectedDateString] = useState(null); // Tracks 'YYYY-MM-DD'

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const startingYear = new Date().getFullYear() - 3;
  const YEAR_DROPDOWN_OPTIONS = Array.from({ length: 8 }, (_, i) => startingYear + i);

  useEffect(() => {
    fetchDeploymentHistory(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const fetchDeploymentHistory = async (month, year) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token'); 
      
      const res = await axios.get(`${API_BASE_URL}/api/admin/assignments/history`, {
        params: { month: month + 1, year: year }, 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setDeployments(res.data.data);
      }
    } catch (err) {
      console.error("Ledger network handshake failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null); 
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const formatDateString = (day) => {
    if (!day) return '';
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  const getMassesForDate = (dateStr) => {
    return deployments.filter(mass => {
      if (!mass.assignmentDate) return false;
      const massDate = new Date(mass.assignmentDate).toISOString().split('T')[0];
      return massDate === dateStr;
    });
  };

  // 🛠️ UPDATED SEARCH ENGINE WITH SEMESTER AND LEVEL FILTERS
  const dateHasSearchMatch = (dateStr) => {
    const dayMasses = getMassesForDate(dateStr);
    return dayMasses.some(mass => isMassMatchingFilters(mass));
  };

  const isMassMatchingFilters = (mass) => {
    // 1. Filter by Semester
    if (selectedSemester !== 'All' && mass.semester !== selectedSemester) return false;

    // 2. Filter by Name and Level
    if (searchName.trim()) {
      const lowerTarget = searchName.toLowerCase().trim();
      const rolesArray = [
        mass.roles?.sacristan, mass.roles?.masterOfCeremonies, mass.roles?.firstAcolyte,
        mass.roles?.secondAcolyte, mass.roles?.crossBearer, mass.roles?.thurifer,
        mass.roles?.boatBearer, mass.roles?.firstAuxiliary, mass.roles?.secondAuxiliary,
        mass.roles?.mitreBearer, mass.roles?.crosierBearer
      ];

      // Check if user is in this mass AND matches the level filter
      const userMatch = rolesArray.some(role => {
        if (!role) return false;
        const nameMatches = (role.name || '').toLowerCase().includes(lowerTarget);
        const levelMatches = selectedLevel === 'All' || role.level === selectedLevel;
        return nameMatches && levelMatches;
      });

      if (!userMatch) return false;
    } else if (selectedLevel !== 'All') {
      // If no name is searched, but level is selected, check if ANYONE in this mass matches the level
      const rolesArray = [
        mass.roles?.sacristan, mass.roles?.masterOfCeremonies, mass.roles?.firstAcolyte,
        mass.roles?.secondAcolyte, mass.roles?.crossBearer, mass.roles?.thurifer,
        mass.roles?.boatBearer, mass.roles?.firstAuxiliary, mass.roles?.secondAuxiliary,
        mass.roles?.mitreBearer, mass.roles?.crosierBearer
      ];
      const levelMatch = rolesArray.some(role => role && role.level === selectedLevel);
      if (!levelMatch) return false;
    }

    // If searchName exists but no semester/level is blocked, it's a match.
    // If no search/level/semester exists, we don't highlight the calendar randomly.
    return (searchName.trim() || selectedSemester !== 'All' || selectedLevel !== 'All');
  };

  const prevMonth = () => {
    setSelectedDateString(null); 
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDateString(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <PulseLoader color="#d2b48c" size={14} />
      <p className="text-[#d2b48c] text-xs font-black uppercase tracking-[0.4em] mt-6 animate-pulse">Assembling Universal Weekly Map...</p>
    </div>
  );

  const activeMasses = selectedDateString ? getMassesForDate(selectedDateString) : [];

  return (
    <div className="w-full space-y-8 animate-fadeIn text-gray-900 dark:text-white select-none font-sans pb-24 transition-colors duration-500">
      
      {/* 🏛️ TOP ACTION CONTROL BANNER WITH NEW FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-[#e6d5c3] dark:border-white/10 pb-6 transition-colors">
        <div>
          <h2 className="text-4xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">ASA Roadmap</h2>
          <p className="text-sm text-[#8b4513] dark:text-amber-500 font-bold uppercase tracking-widest mt-2">🛡️ Universal Multi-Year Roster Ledger Matrix Archive</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-white dark:bg-[#111] border-2 border-[#e6d5c3] dark:border-white/20 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-[#8b4513] dark:focus:border-amber-500 cursor-pointer shadow-sm"
          >
            <option value="All">All Semesters</option>
            <option value="Harmattan Semester">Harmattan</option>
            <option value="Rain Semester">Rain</option>
          </select>

          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white dark:bg-[#111] border-2 border-[#e6d5c3] dark:border-white/20 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-[#8b4513] dark:focus:border-amber-500 cursor-pointer shadow-sm"
          >
            <option value="All">All Levels</option>
            <option value="100L">100L</option>
            <option value="200L">200L</option>
            <option value="300L">300L</option>
            <option value="400L">400L</option>
            <option value="500L">500L</option>
          </select>

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search name..." 
              value={searchName} 
              onChange={(e) => setSearchName(e.target.value)} 
              className="w-full bg-white dark:bg-[#111] border-2 border-[#e6d5c3] dark:border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-[#8b4513] dark:focus:border-amber-500 transition-all shadow-sm" 
            />
          </div>
        </div>
      </div>

      {/* 📊 UNIVERSAL INTERACTIVE CALENDAR CONTAINER HUB */}
      <div className="bg-white dark:bg-[#111111] border border-[#e6d5c3] dark:border-white/5 rounded-3xl p-6 shadow-2xl max-w-3xl mx-auto">
        
        {/* MONTH & YEAR DROPDOWN CONTROL BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-[#8b4513] dark:text-[#d2b48c] outline-none">
              <FaChevronLeft size={12} />
            </button>
            
            <select 
              value={currentMonth}
              onChange={(e) => { setCurrentMonth(parseInt(e.target.value)); setSelectedDateString(null); }}
              className="bg-neutral-100 dark:bg-white/5 border-0 rounded-xl py-2 px-3 text-sm font-black uppercase tracking-wider text-[#8b4513] dark:text-[#d2b48c] cursor-pointer outline-none appearance-none"
            >
              {MONTHS.map((m, index) => (
                <option className="dark:bg-black text-gray-900 dark:text-white" key={m} value={index}>{m}</option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => { setCurrentYear(parseInt(e.target.value)); setSelectedDateString(null); }}
              className="bg-neutral-100 dark:bg-white/5 border-0 rounded-xl py-2 px-4 text-sm font-black tracking-wider text-gray-900 dark:text-white cursor-pointer outline-none appearance-none"
            >
              {YEAR_DROPDOWN_OPTIONS.map(yr => (
                <option className="dark:bg-black text-gray-900 dark:text-white" key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            <button onClick={nextMonth} className="p-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-[#8b4513] dark:text-[#d2b48c] outline-none">
              <FaChevronRight size={12} />
            </button>
          </div>

          <h3 className="hidden sm:block text-base font-black tracking-widest uppercase text-neutral-400">
            {MONTHS[currentMonth]} <span className="text-[#8b4513] dark:text-amber-500 font-sans">{currentYear}</span>
          </h3>
        </div>

        {/* CALENDAR WEEKDAY ROW GRID */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {DAYS_SHORT.map(d => (
            <span key={d} className="text-[11px] font-black uppercase text-gray-400 tracking-wider py-1">{d}</span>
          ))}
        </div>

        {/* SEVEN-COLUMN MATRIX HOLES */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((day, idx) => {
            const dateStr = formatDateString(day);
            const dayMasses = day ? getMassesForDate(dateStr) : [];
            const hasMasses = dayMasses.length > 0;
            const isSelected = selectedDateString === dateStr;
            const isHighlighted = dateHasSearchMatch(dateStr);

            if (!day) return <div key={`empty-${idx}`} className="aspect-square opacity-0"></div>;

            return (
              <button
                key={`day-${day}`}
                type="button"
                onClick={() => hasMasses && setSelectedDateString(isSelected ? null : dateStr)}
                className={`aspect-square rounded-xl border flex flex-col justify-between p-2 relative transition-all duration-200 outline-none text-left ${
                  !hasMasses 
                    ? 'border-neutral-100 dark:border-white/5 bg-transparent opacity-20 cursor-not-allowed' 
                    : isSelected
                      ? 'border-[#8b4513] dark:border-amber-500 bg-[#8b4513]/10 dark:bg-[#1a110b] shadow-inner scale-[0.98]'
                      : isHighlighted
                        ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 animate-pulse cursor-pointer'
                        : 'border-[#e6d5c3] dark:border-white/10 bg-white dark:bg-black/40 hover:border-[#8b4513] dark:hover:border-amber-500 cursor-pointer'
                }`}
                disabled={!hasMasses}
              >
                <span className={`text-sm font-black ${isSelected ? 'text-[#8b4513] dark:text-amber-500' : isHighlighted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{day}</span>
                
                {hasMasses && (
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md self-end block text-center uppercase ${
                    isSelected 
                      ? 'bg-[#8b4513] text-white' 
                      : isHighlighted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-gray-400'
                  }`}>
                    {dayMasses.length}M
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🖥️ DYNAMIC CLIENT DRILL DOWN DETAIL DISPLAY PANELS */}
      {selectedDateString && (
        <div className="bg-white/90 dark:bg-[#0c0c0c] border-2 border-[#e6d5c3] dark:border-white/10 rounded-3xl p-6 md:p-10 animate-slideUp shadow-2xl space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 border-b-2 border-[#e6d5c3] dark:border-white/5 pb-4">
            <div className="p-3 bg-[#8b4513]/10 dark:bg-[#1a110b] border-2 border-[#8b4513]/20 dark:border-[#3d2b1f] rounded-2xl text-[#8b4513] dark:text-[#d2b48c]">
              <FaCalendarDay size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-gray-900 dark:text-white uppercase tracking-wide">Liturgical Deployment: {selectedDateString}</h3>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Displaying the active rosters synced across selected temporal points</p>
            </div>
          </div>

          {activeMasses.length === 0 ? (
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest py-10 text-center">No Liturgical deployments saved for this specific date sector.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMasses.map((mass) => {
                const isMatch = isMassMatchingFilters(mass);

                return (
                  <div key={mass._id} className={`border-2 rounded-3xl p-6 flex flex-col justify-between bg-white dark:bg-black/60 backdrop-blur-md transition-all ${isMatch ? 'border-[#8b4513] dark:border-amber-500 shadow-[0_0_30px_rgba(139,69,19,0.15)] dark:shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-[#e6d5c3] dark:border-white/5'}`}>
                    <div>
                      <div className="flex justify-between items-start border-b border-[#e6d5c3] dark:border-white/5 pb-4 mb-4">
                        <div>
                          <h4 className="text-xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">{mass.massTitle}</h4>
                          <span className="text-[10px] font-black tracking-widest uppercase text-[#8b4513] dark:text-amber-500 mt-1 inline-block">{mass.serviceType} • {mass.semester}</span>
                        </div>
                        <div className="text-xs text-right font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-[#e6d5c3] dark:border-white/10 px-3 py-1 rounded-xl">{mass.assignmentTime}</div>
                      </div>

                      {/* 📋 ROSTER DISPLAY */}
                      <div className="space-y-2 mt-4">
                        <ReadOnlyRow label="Sacristan" name={mass.roles?.sacristan?.name || mass.sacristan} level={mass.roles?.sacristan?.level} roleKey="sacristan" attendanceMap={mass.attendance} color="text-gray-400" />
                        <ReadOnlyRow label="MC" name={mass.roles?.masterOfCeremonies?.name || mass.masterOfCeremonies} level={mass.roles?.masterOfCeremonies?.level} roleKey="masterOfCeremonies" attendanceMap={mass.attendance} color="text-emerald-400" />
                        <ReadOnlyRow label="1st Acolyte" name={mass.roles?.firstAcolyte?.name || mass.firstAcolyte} level={mass.roles?.firstAcolyte?.level} roleKey="firstAcolyte" attendanceMap={mass.attendance} color="text-blue-400" />
                        
                        {mass.hasSecondAcolyte && (
                          <ReadOnlyRow label="2nd Acolyte" name={mass.roles?.secondAcolyte?.name || mass.secondAcolyte} level={mass.roles?.secondAcolyte?.level} roleKey="secondAcolyte" attendanceMap={mass.attendance} color="text-blue-400" />
                        )}
                        
                        <ReadOnlyRow label="Cross Bearer" name={mass.roles?.crossBearer?.name || mass.crossBearer} level={mass.roles?.crossBearer?.level} roleKey="crossBearer" attendanceMap={mass.attendance} color="text-purple-400" />
                        
                        {mass.serviceType !== 'Evening Mass' && (
                          <>
                            <ReadOnlyRow label="Thurifer" name={mass.roles?.thurifer?.name || mass.thurifer} level={mass.roles?.thurifer?.level} roleKey="thurifer" attendanceMap={mass.attendance} color="text-orange-400" />
                            <ReadOnlyRow label="Boat Bearer" name={mass.roles?.boatBearer?.name || mass.boatBearer} level={mass.roles?.boatBearer?.level} roleKey="boatBearer" attendanceMap={mass.attendance} color="text-orange-400/70" />
                            <ReadOnlyRow label="Auxiliary 1" name={mass.roles?.firstAuxiliary?.name || mass.firstAuxiliary} level={mass.roles?.firstAuxiliary?.level} roleKey="firstAuxiliary" attendanceMap={mass.attendance} color="text-amber-500" />
                            <ReadOnlyRow label="Auxiliary 2" name={mass.roles?.secondAuxiliary?.name || mass.secondAuxiliary} level={mass.roles?.secondAuxiliary?.level} roleKey="secondAuxiliary" attendanceMap={mass.attendance} color="text-amber-500/70" />
                          </>
                        )}
                        
                        {mass.serviceType === 'Bishop Mass' && (
                          <>
                            <ReadOnlyRow label="Mitre Bearer" name={mass.roles?.mitreBearer?.name || mass.mitreBearer} level={mass.roles?.mitreBearer?.level} roleKey="mitreBearer" attendanceMap={mass.attendance} color="text-yellow-500" />
                            <ReadOnlyRow label="Crosier Bearer" name={mass.roles?.crosierBearer?.name || mass.crosierBearer} level={mass.roles?.crosierBearer?.level} roleKey="crosierBearer" attendanceMap={mass.attendance} color="text-yellow-500" />
                          </>
                        )}
                      </div>
                    </div>
                    {isMatch && (
                      <div className="mt-6 pt-4 border-t border-[#8b4513]/20 dark:border-amber-500/20 text-center">
                        <p className="text-[10px] text-[#8b4513] dark:text-amber-500 font-black uppercase tracking-widest animate-pulse">🛡️ Filter match detected on this roster</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 🛠️ UPGRADED TO ACCEPT AND DISPLAY LEVEL
const ReadOnlyRow = ({ label, name, level, roleKey, attendanceMap, color }) => {
  if (!name || name.trim() === "") return null;

  let status = undefined;
  if (attendanceMap) {
    const cleanKey = String(roleKey).trim();
    if (typeof attendanceMap.get === 'function') {
      status = attendanceMap.get(cleanKey);
    } else {
      status = attendanceMap[cleanKey];
    }
  }

  const isServed = status === 'Served';

  return (
    <div className={`flex justify-between items-center p-3 border-2 rounded-xl transition-all select-none ${
      status === undefined 
        ? 'border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-black/40' 
        : isServed 
          ? 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/10' 
          : 'border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/10'
    }`}>
      <div className="truncate max-w-[70%]">
        <p className={`text-[8px] uppercase font-black tracking-wider ${color}`}>{label}</p>
        <p className="text-xs font-bold text-neutral-800 dark:text-white uppercase truncate mt-0.5">
          {name} {level && level !== 'All Levels' && <span className="text-[9px] text-gray-500 ml-1 lowercase">({level})</span>}
        </p>
      </div>
      {status === undefined ? (
        <span className="text-[9px] font-black text-neutral-500 dark:text-gray-400 uppercase bg-neutral-200/50 dark:bg-white/10 px-2 py-0.5 rounded border border-neutral-300 dark:border-white/10 tracking-wider">Scheduled</span>
      ) : isServed ? (
        <span className="flex items-center gap-1 text-[9px] font-black text-green-600 dark:text-green-400 uppercase bg-green-100 dark:bg-green-950/50 px-2 py-0.5 rounded border border-green-200 dark:border-green-900/30"><FaCheckCircle size={10} /> Served</span>
      ) : (
        <span className="flex items-center gap-1 text-[9px] font-black text-red-600 dark:text-red-400 uppercase bg-red-100 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/30"><FaTimesCircle size={10} /> Missed</span>
      )}
    </div>
  );
};

export default MassSelection;