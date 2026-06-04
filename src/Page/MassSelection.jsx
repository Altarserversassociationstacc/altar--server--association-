import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, FaSearch, FaCalendarDay, FaChevronDown, 
  FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const MassSelection = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  
  // 📆 UNRESTRICTED DYNAMIC CALENDAR ENGINE STATE
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0 - 11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Fully dynamic year initialization
  const [selectedDateString, setSelectedDateString] = useState(null); // Tracks 'YYYY-MM-DD'

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate an array of years dynamically for dropdown selection (e.g., 5 years back to 5 years forward)
  const startingYear = new Date().getFullYear() - 3;
  const YEAR_DROPDOWN_OPTIONS = Array.from({ length: 8 }, (_, i) => startingYear + i);

  useEffect(() => {
    fetchDeploymentHistory();
  }, []);

  const fetchDeploymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token'); 
      const res = await axios.get(`${API_BASE_URL}/api/admin/assignments/history`, {
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

  // 🧠 CALENDAR CALCULATIONS ENGINE (Handles Leap Years automatically)
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  // Compile calendar cells array grid layout offsets
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null); 
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Pure data string mapper to standardize ISO date comparison criteria
  const formatDateString = (day) => {
    if (!day) return '';
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Filters assignments matching selected dates dynamically
  const getMassesForDate = (dateStr) => {
    return deployments.filter(mass => {
      if (!mass.assignmentDate) return false;
      const massDate = new Date(mass.assignmentDate).toISOString().split('T')[0];
      return massDate === dateStr;
    });
  };

  // Real-time highlight detector for the search bar
  const dateHasSearchMatch = (dateStr) => {
    if (!searchName.trim()) return false;
    const dayMasses = getMassesForDate(dateStr);
    return dayMasses.some(mass => isUserAssignedHere(mass, searchName));
  };

  const isUserAssignedHere = (assignment, targetName) => {
    if (!targetName.trim()) return false;
    const lowerTarget = targetName.toLowerCase().trim();
    return [
      assignment.sacristan, assignment.masterOfCeremonies, assignment.firstAcolyte,
      assignment.secondAcolyte, assignment.crossBearer, assignment.thurifer,
      assignment.boatBearer, assignment.firstAuxiliary, assignment.secondAuxiliary,
      assignment.mitreBearer, assignment.crosierBearer
    ].some(role => role && role.toLowerCase().includes(lowerTarget));
  };

  // 🔄 UNRESTRICTED PAGINATION FLOWS
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDateString(null); // Clear selected records preview row smoothly on shift
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDateString(null);
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
      
      {/* 🏛️ TOP ACTION CONTROL BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-2 border-[#e6d5c3] dark:border-white/10 pb-6 transition-colors">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Liturgical Roadmap</h2>
          <p className="text-sm text-[#8b4513] dark:text-amber-500 font-bold uppercase tracking-widest mt-2">🛡️ Universal Multi-Year Roster Ledger Matrix Archive</p>
        </div>

        <div className="relative w-full lg:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search name to trace highlighted dates..." 
            value={searchName} 
            onChange={(e) => setSearchName(e.target.value)} 
            className="w-full bg-white dark:bg-black border-2 border-[#e6d5c3] dark:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-[#8b4513] dark:focus:border-amber-500 transition-all shadow-2xl" 
          />
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
            
            {/* Dynamic Month Quick Jumper Dropdown */}
            <select 
              value={currentMonth}
              onChange={(e) => { setCurrentMonth(parseInt(e.target.value)); setSelectedDateString(null); }}
              className="bg-neutral-100 dark:bg-white/5 border-0 rounded-xl py-2 px-3 text-sm font-black uppercase tracking-wider text-[#8b4513] dark:text-[#d2b48c] cursor-pointer outline-none appearance-none"
            >
              {MONTHS.map((m, index) => (
                <option className="dark:bg-black text-gray-900 dark:text-white" key={m} value={index}>{m}</option>
              ))}
            </select>

            {/* Dynamic Year Quick Jumper Dropdown */}
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
                const isMatch = isUserAssignedHere(mass, searchName);

                return (
                  <div key={mass._id} className={`border-2 rounded-3xl p-6 flex flex-col justify-between bg-white dark:bg-black/60 backdrop-blur-md transition-all ${isMatch ? 'border-[#8b4513] dark:border-amber-500 shadow-[0_0_30px_rgba(139,69,19,0.15)] dark:shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-[#e6d5c3] dark:border-white/5'}`}>
                    <div>
                      <div className="flex justify-between items-start border-b border-[#e6d5c3] dark:border-white/5 pb-4 mb-4">
                        <div>
                          <h4 className="text-xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">{mass.massTitle}</h4>
                          <span className="text-[10px] font-black tracking-widest uppercase text-[#8b4513] dark:text-amber-500 mt-1 inline-block">{mass.serviceType}</span>
                        </div>
                        <div className="text-xs text-right font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-[#e6d5c3] dark:border-white/10 px-3 py-1 rounded-xl">{mass.assignmentTime}</div>
                      </div>

                      {/* 📋 ROSTER DISPLAY SUBROW ROWS */}
                      <div className="space-y-2 mt-4">
                        <ReadOnlyRow label="Sacristan" name={mass.sacristan} roleKey="Sacristan" attendanceMap={mass.attendance} color="text-gray-400" />
                        <ReadOnlyRow label="MC" name={mass.masterOfCeremonies} roleKey="MC" attendanceMap={mass.attendance} color="text-emerald-400" />
                        <ReadOnlyRow label="1st Acolyte" name={mass.firstAcolyte} roleKey="1st Acolyte" attendanceMap={mass.attendance} color="text-blue-400" />
                        {mass.hasSecondAcolyte && <ReadOnlyRow label="2nd Acolyte" name={mass.secondAcolyte} roleKey="2nd Acolyte" attendanceMap={mass.attendance} color="text-blue-400" />}
                        <ReadOnlyRow label="Cross Bearer" name={mass.crossBearer} roleKey="Cross Bearer" attendanceMap={mass.attendance} color="text-purple-400" />
                        <ReadOnlyRow label="Thurifer" name={mass.thurifer} roleKey="Thurifer" attendanceMap={mass.attendance} color="text-orange-400" />
                        <ReadOnlyRow label="Boat Bearer" name={mass.boatBearer} roleKey="Boat Bearer" attendanceMap={mass.attendance} color="text-orange-400/70" />
                        <ReadOnlyRow label="Auxiliary 1" name={mass.firstAuxiliary} roleKey="Auxiliary 1" attendanceMap={mass.attendance} color="text-amber-500" />
                        <ReadOnlyRow label="Auxiliary 2" name={mass.secondAuxiliary} roleKey="Auxiliary 2" attendanceMap={mass.attendance} color="text-amber-500/70" />
                        
                        {mass.serviceType === 'Bishop Mass' && (
                          <>
                            <ReadOnlyRow label="Mitre Bearer" name={mass.mitreBearer} roleKey="Mitre Bearer" attendanceMap={mass.attendance} color="text-yellow-500" />
                            <ReadOnlyRow label="Crosier Bearer" name={mass.crosierBearer} roleKey="Crosier Bearer" attendanceMap={mass.attendance} color="text-yellow-500" />
                          </>
                        )}
                      </div>
                    </div>
                    {isMatch && (
                      <div className="mt-6 pt-4 border-t border-[#8b4513]/20 dark:border-amber-500/20 text-center">
                        <p className="text-[10px] text-[#8b4513] dark:text-amber-500 font-black uppercase tracking-widest animate-pulse">🛡️ You are currently deployed on this sanctuary roster</p>
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

const ReadOnlyRow = ({ label, name, roleKey, attendanceMap, color }) => {
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
        <p className="text-xs font-bold text-neutral-800 dark:text-white uppercase truncate mt-0.5">{name}</p>
      </div>
      {status === undefined ? (
        <span className="text-[9px] font-black text-neutral-500 dark:text-gray-500 uppercase bg-neutral-200/50 dark:bg-white/5 px-2 py-0.5 rounded border border-neutral-300 dark:border-white/10">Pending Audit</span>
      ) : isServed ? (
        <span className="flex items-center gap-1 text-[9px] font-black text-green-600 dark:text-green-400 uppercase bg-green-100 dark:bg-green-950/50 px-2 py-0.5 rounded border border-green-200 dark:border-green-900/30"><FaCheckCircle size={10} /> Served</span>
      ) : (
        <span className="flex items-center gap-1 text-[9px] font-black text-red-600 dark:text-red-400 uppercase bg-red-100 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/30"><FaTimesCircle size={10} /> Missed</span>
      )}
    </div>
  );
};

export default MassSelection;