import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, FaSearch, FaCalendarDay, FaChevronDown, FaHistory, FaCheckCircle, FaTimesCircle 
} from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const MassSelection = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchDeploymentHistory();
  }, []);

  const fetchDeploymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
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

  const groupedMasses = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = deployments.filter(mass => {
      const massDate = new Date(mass.assignmentDate);
      return massDate.toLocaleDateString('en-US', { weekday: 'long' }) === day;
    });
    return acc;
  }, {});

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <PulseLoader color="#d2b48c" size={14} />
      <p className="text-[#d2b48c] text-xs font-black uppercase tracking-[0.4em] mt-6 animate-pulse">Assembling Universal Weekly Map...</p>
    </div>
  );

  return (
    <div className="w-full space-y-10 animate-fadeIn text-white select-none font-sans pb-24">
      
      {/* 🏛️ TOP ACTION CONTROL BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-2 border-white/10 pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Liturgical Roadmap</h2>
          <p className="text-sm text-blue-400 font-bold uppercase tracking-widest mt-2">🛡️ Transparent Liturgical Assignments Registry & Status Monitor</p>
        </div>

        <div className="relative w-full lg:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Type your name to scan deployment..." 
            value={searchName} 
            onChange={(e) => setSearchName(e.target.value)} 
            className="w-full bg-black border-2 border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-all shadow-2xl" 
          />
        </div>
      </div>

      {/* 📊 THE 7-DAY IMMERSIVE GRID MATRIX LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayMasses = groupedMasses[day] || [];
          const hasMasses = dayMasses.length > 0;
          const isExpanded = expandedDay === day;

          return (
            <div 
              key={day} 
              onClick={() => setExpandedDay(isExpanded ? null : day)} 
              className={`rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
                isExpanded 
                ? 'bg-gradient-to-b from-[#1a110b] to-[#0a0a0a] border-[#d2b48c] scale-[1.02]' 
                : hasMasses 
                  ? 'bg-black/40 border-blue-900/40 hover:border-blue-500' 
                  : 'bg-black/10 border-white/5 opacity-40'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-black uppercase tracking-wider text-gray-400">{day.substring(0, 3)}</span>
                  {hasMasses && <span className="bg-blue-950/80 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-900/40">{dayMasses.length} Mass</span>}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mt-1">{day}</h3>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-gray-500">
                <span>{hasMasses ? "Inspect Roster" : "Empty Slot"}</span>
                <FaChevronDown size={10} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#d2b48c]' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🖥️ DYNAMIC CLIENT DRILL DOWN WORKSPACE LAYOUT */}
      {expandedDay && (
        <div className="bg-[#0c0c0c] border-2 border-white/10 rounded-3xl p-6 md:p-10 animate-slideUp shadow-2xl space-y-8">
          <div className="flex items-center gap-4 border-b-2 border-white/5 pb-4">
            <div className="p-3 bg-[#1a110b] border-2 border-[#3d2b1f] rounded-2xl text-[#d2b48c]"><FaCalendarDay size={20} /></div>
            <div>
              <h3 className="text-2xl font-serif text-white uppercase tracking-wide">Liturgies Scheduled on {expandedDay}</h3>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Read-only parameters synchronized live from database cluster</p>
            </div>
          </div>

          {groupedMasses[expandedDay].length === 0 ? (
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest py-10 text-center">No Liturgical deployments saved for this specific date sector.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedMasses[expandedDay].map((mass) => {
                const isMatch = isUserAssignedHere(mass, searchName);

                return (
                  <div key={mass._id} className={`border-2 rounded-3xl p-6 flex flex-col justify-between bg-black/60 backdrop-blur-md transition-all ${isMatch ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-white/5'}`}>
                    <div>
                      <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                        <div>
                          <h4 className="text-xl font-serif font-bold text-white tracking-tight">{mass.massTitle}</h4>
                          <span className="text-[10px] font-black tracking-widest uppercase text-blue-400 mt-1 inline-block">{mass.serviceType}</span>
                        </div>
                        <div className="text-xs text-right font-mono font-bold text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">{mass.assignmentTime}</div>
                      </div>

                      {/* 📋 ATTENDANCE CHECKLIST */}
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
                      <div className="mt-6 pt-4 border-t border-blue-500/20 text-center">
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest animate-pulse">🛡️ You are currently deployed on this sanctuary roster</p>
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

// 🔒 RIGID PRISTINE READ-ONLY ATTENDANCE RENDERING CARD COMPONENT
const ReadOnlyRow = ({ label, name, roleKey, attendanceMap, color }) => {
  if (!name || name.trim() === "") return null;

  let status = undefined;
  if (attendanceMap) {
    // Convert string keys starting with digits to explicit literal identifiers safely
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
        ? 'border-white/5 bg-black/40 opacity-70' 
        : isServed 
          ? 'border-green-900/50 bg-green-950/10' 
          : 'border-red-950 bg-red-950/10'
    }`}>
      <div className="truncate max-w-[70%]">
        <p className={`text-[8px] uppercase font-black tracking-wider ${color}`}>{label}</p>
        <p className="text-xs font-bold text-white uppercase truncate mt-0.5">{name}</p>
      </div>
      {status === undefined ? (
        <span className="text-[9px] font-black text-gray-500 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">Pending Audit</span>
      ) : isServed ? (
        <span className="flex items-center gap-1 text-[9px] font-black text-green-400 uppercase bg-green-950/50 px-2 py-0.5 rounded border border-green-900/30"><FaCheckCircle size={10} /> Served</span>
      ) : (
        <span className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase bg-red-950/50 px-2 py-0.5 rounded border border-red-900/30"><FaTimesCircle size={10} /> Missed</span>
      )}
    </div>
  );
};

export default MassSelection;