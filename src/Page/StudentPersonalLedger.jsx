import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaChurch, FaCheckCircle, FaClock, FaTimesCircle, FaChevronDown } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const StudentPersonalLedger = ({ studentName }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🎴 Active Filter States
  const [activeSemester, setActiveSemester] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All');

  useEffect(() => {
    if (studentName) fetchMyLedger();
  }, [studentName]);

  const fetchMyLedger = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.get(`${API_BASE_URL}/api/admin/student/my-assignments/search?name=${encodeURIComponent(studentName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load personal ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Determine Role and Status helper
  const getStudentAssignmentDetails = (mass) => {
    let roleKey = null;
    if (mass.roles) {
      roleKey = Object.keys(mass.roles).find(key => mass.roles[key]?.name === studentName);
    }
    if (!roleKey) {
      roleKey = Object.keys(mass).find(key => mass[key] === studentName);
    }

    let status = 'Scheduled';
    if (mass.attendance && roleKey) {
      const attendanceValue = typeof mass.attendance.get === 'function' 
        ? mass.attendance.get(roleKey) 
        : mass.attendance[roleKey];
      
      if (attendanceValue === 'Served') status = 'Served';
      if (attendanceValue === 'Missed') status = 'Missed';
    }

    return { roleKey, status };
  };

  // 🔄 INSTANT FILTERING ENGINE
  const displayedRecords = useMemo(() => {
    return history.filter(mass => {
      // Filter by Semester
      if (activeSemester !== 'All') {
        const massSemester = (mass.semester || '').toLowerCase();
        if (!massSemester.includes(activeSemester.toLowerCase())) return false;
      }
      
      // Filter by Level
      if (activeLevel !== 'All') {
        const roleData = mass.roles && Object.values(mass.roles).find(r => r?.name === studentName);
        const massLevel = roleData?.level || mass.level || 'Unknown';
        if (massLevel !== activeLevel) return false;
      }

      return true;
    });
  }, [history, activeSemester, activeLevel, studentName]);

  // 📊 Calculate Stats for the current view
  const stats = useMemo(() => {
    const total = displayedRecords.length;
    const served = displayedRecords.filter(m => getStudentAssignmentDetails(m).status === 'Served').length;
    return { total, served };
  }, [displayedRecords]);

  return (
    <div className="w-full max-w-5xl mx-auto font-sans space-y-6">
      
      {/* 🎴 CLEAN DROP-DOWN FILTER CARD */}
      <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-[#d2b48c]/30 rounded-3xl p-6 shadow-xl">
        <div className="mb-6 border-b border-stone-200 dark:border-white/10 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tight">Mass Records</h2>
            <p className="text-xs text-stone-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-widest">Select filters below to view records</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-serif text-[#8b4513] dark:text-[#d2b48c] font-bold leading-none">{stats.served} <span className="text-lg text-stone-400">/ {stats.total}</span></p>
            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-500 mt-1">Masses Served</p>
          </div>
        </div>

        {/* Dropdowns Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Semester Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] text-stone-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">
              Semester Section
            </label>
            <div className="relative">
              <select
                value={activeSemester}
                onChange={(e) => setActiveSemester(e.target.value)}
                className="w-full appearance-none bg-stone-100 dark:bg-[#1a1a1a] border border-stone-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-stone-700 dark:text-gray-300 outline-none focus:border-[#8b4513] dark:focus:border-[#d2b48c] transition-colors cursor-pointer"
              >
                <option value="All">All Semesters</option>
                <option value="Harmattan Semester">Harmattan Semester</option>
                <option value="Rain Semester">Rain Semester</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <FaChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* Level Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] text-stone-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">
              Level Section
            </label>
            <div className="relative">
              <select
                value={activeLevel}
                onChange={(e) => setActiveLevel(e.target.value)}
                className="w-full appearance-none bg-stone-100 dark:bg-[#1a1a1a] border border-stone-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-stone-700 dark:text-gray-300 outline-none focus:border-[#8b4513] dark:focus:border-[#d2b48c] transition-colors cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="100L">100L</option>
                <option value="200L">200L</option>
                <option value="300L">300L</option>
                <option value="400L">400L</option>
                <option value="500L">500L</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <FaChevronDown size={12} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 📊 THE RESULTS AREA */}
      <div className="bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-white/5 rounded-3xl p-6 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PulseLoader color="#8b4513" size={12} />
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-4 animate-pulse">Syncing Matrix...</p>
          </div>
        ) : displayedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-stone-200 dark:border-white/10 rounded-2xl">
            <FaChurch size={32} className="text-stone-300 dark:text-white/10 mb-4" />
            <p className="text-sm font-bold text-stone-500 dark:text-gray-400 uppercase tracking-wide">No assignments found</p>
            <p className="text-[10px] text-stone-400 dark:text-gray-600 uppercase tracking-widest mt-1">Try adjusting your drop-down filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-stone-900 dark:text-white text-sm font-black uppercase tracking-wider mb-4 border-b border-stone-200 dark:border-white/10 pb-3">
              Matched Liturgical Deployments
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayedRecords.map((mass) => {
                const { roleKey, status } = getStudentAssignmentDetails(mass);
                const roleLabel = ROLE_MATRIX.find(r => r.apiKey === roleKey)?.uiLabel || roleKey || 'Server';

                return (
                  <div key={mass._id} className="bg-white dark:bg-[#111] border border-stone-200 dark:border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 hover:-translate-y-1 transition-transform shadow-sm">
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <FaChurch className="text-[#8b4513] dark:text-[#d2b48c]" size={14} />
                        <h4 className="text-sm font-black text-stone-900 dark:text-white tracking-tight">{mass.massTitle}</h4>
                      </div>
                      <div className="inline-flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-gray-400 bg-stone-50 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                        <span>{new Date(mass.assignmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{mass.assignmentTime}</span>
                        <span>•</span>
                        <span className="text-[#8b4513] dark:text-amber-500">{mass.semester}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end justify-center min-w-[120px] bg-stone-50 dark:bg-black p-3 rounded-xl border border-stone-100 dark:border-white/5">
                      <p className="text-[9px] uppercase font-black text-stone-400 dark:text-gray-500 tracking-widest mb-1">Role Assigned</p>
                      <p className="text-xs font-black text-stone-800 dark:text-white uppercase mb-2">{roleLabel}</p>
                      
                      {status === 'Served' && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/50 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900/30">
                          <FaCheckCircle size={10} /> Served
                        </span>
                      )}
                      {status === 'Missed' && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-100 dark:bg-rose-950/50 px-2 py-1 rounded border border-rose-200 dark:border-rose-900/30">
                          <FaTimesCircle size={10} /> Missed
                        </span>
                      )}
                      {status === 'Scheduled' && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/50 px-2 py-1 rounded border border-amber-200 dark:border-amber-900/30">
                          <FaClock size={10} /> Scheduled
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ROLE_MATRIX = [
  { apiKey: 'sacristan', uiLabel: 'Sacristan' },
  { apiKey: 'masterOfCeremonies', uiLabel: 'MC' },
  { apiKey: 'firstAcolyte', uiLabel: '1st Acolyte' },
  { apiKey: 'secondAcolyte', uiLabel: '2nd Acolyte' },
  { apiKey: 'crossBearer', uiLabel: 'Cross Bearer' },
  { apiKey: 'thurifer', uiLabel: 'Thurifer' },
  { apiKey: 'boatBearer', uiLabel: 'Boat Bearer' },
  { apiKey: 'firstAuxiliary', uiLabel: 'Auxiliary 1' },
  { apiKey: 'secondAuxiliary', uiLabel: 'Auxiliary 2' },
  { apiKey: 'mitreBearer', uiLabel: 'Mitre Bearer' },
  { apiKey: 'crosierBearer', uiLabel: 'Crosier Bearer' }
];

export default StudentPersonalLedger;