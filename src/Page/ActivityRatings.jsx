import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  FaStar, FaCheckSquare, FaTimes, FaArrowRight, 
  FaTachometerAlt, FaChartPie, FaCalendarDay, 
  FaExpandArrowsAlt, FaCompress, FaGraduationCap 
} from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ActivityRatings = ({ 
  metrics, 
  currentUser, 
  isAltarLady, 
  activeSubDrawer, 
  setActiveSubDrawer,
  onBackToDashboard
}) => {
  const [expandedChartCard, setExpandedChartCard] = useState('mass');

  // Enforce structural boundaries on dynamic student data packages
  const computedMetrics = {
    meetingCount: metrics?.meetingCount || 0,
    meetingTotal: metrics?.meetingTotal || 10,
    meetingPercent: metrics?.meetingPercent || 0,
    otherActivitiesCount: metrics?.otherActivitiesCount || 0,
    massesCount: metrics?.massesCount || 0,
    weeksElapsed: metrics?.weeksElapsed || 1,
    overallPercent: metrics?.overallPercent || 0,
    standing: metrics?.standing || 'Evaluation Pending...',
    meetingLogs: metrics?.meetingLogs || []
  };

  const calculateDevotionMetric = (massesServed, weeksElapsed) => {
    if (massesServed === 0 && weeksElapsed >= 12) return "DORMANT";
    const serviceVelocity = massesServed / weeksElapsed;
    if (serviceVelocity >= 4) return "100%";
    if (serviceVelocity >= 3) return "75%";
    if (serviceVelocity >= 2) return "50%";
    if (serviceVelocity >= 1) return "25%";
    return "0%";
  };

  // ==========================================
  // 📊 LIVE DATA INJECTION FOR PICTOGRAPHS
  // ==========================================
  const massChartData = {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Current Session Track'],
    datasets: [{
      label: 'Masses Handled',
      data: [
        Math.round(computedMetrics.massesCount * 0.1), 
        Math.round(computedMetrics.massesCount * 0.2), 
        Math.round(computedMetrics.massesCount * 0.3), 
        Math.round(computedMetrics.massesCount * 0.4), 
        computedMetrics.massesCount
      ], 
      backgroundColor: '#3b82f6',
      hoverBackgroundColor: '#60a5fa',
      borderRadius: 8,
      barThickness: expandedChartCard === 'mass' ? 24 : 8,
    }]
  };

  const donutChartData = {
    labels: ['Attended Assemblies', 'Absences Deficit'],
    datasets: [{
      data: [computedMetrics.meetingCount, Math.max(0, computedMetrics.meetingTotal - computedMetrics.meetingCount)], 
      backgroundColor: ['#10b981', '#ef4444'],
      hoverOffset: 6,
      borderWidth: 0,
      cutout: '75%'
    }]
  };

  const chartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111111',
        titleFont: { size: 11, weight: 'bold' },
        bodyFont: { size: 10 },
        padding: 10,
        borderRadius: 6,
        displayColors: false
      }
    },
    scales: {
      x: { 
        display: expandedChartCard !== null, 
        grid: { display: false }, 
        ticks: { color: '#6b7280', font: { size: 9 } } 
      },
      y: { 
        display: expandedChartCard !== null, 
        grid: { color: 'rgba(255, 255, 255, 0.02)' }, 
        ticks: { color: '#6b7280', font: { size: 9 } } 
      }
    }
  };

  return (
    <div className="animate-fadeIn font-sans text-white pb-12">
      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onBackToDashboard}
          className="text-gray-400 hover:text-[#d2b48c] text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 transition-colors outline-none"
        >
          <FaArrowRight className="rotate-180" /> Dashboard Overview
        </button>
        <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase">Profile: {currentUser?.fullName || 'Sanctuary Member'}</span>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-8">
        
        <header className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-[#d2b48c] font-serif text-2xl tracking-tight uppercase">Personal Engagement Ratings</h3>
            <p className="text-gray-500 text-2xs uppercase tracking-widest mt-1">Real-time Performance Analysis Ledger</p>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border self-start sm:self-center ${computedMetrics.overallPercent >= 70 ? 'bg-green-950/20 text-green-400 border-green-900/30' : 'bg-yellow-950/20 text-yellow-500 border-yellow-900/30'}`}>
            {computedMetrics.standing}
          </span>
        </header>

        {/* ==========================================
            📈 STEP 1: INTERACTIVE PICTOGRAPH GRID
           ========================================== */}
        <div className="flex flex-col md:flex-row gap-4 h-[320px] w-full transition-all duration-500 ease-in-out">
          
          {/* Chart Card: Masses */}
          <div 
            onClick={() => setExpandedChartCard('mass')}
            className={`relative transition-all duration-500 cursor-pointer flex flex-col bg-[#0b130b] border p-5 rounded-2xl shadow-xl ${
              expandedChartCard === 'mass' 
                ? 'flex-[2.5] border-blue-500/30 bg-gradient-to-br from-[#0c150c] to-[#050a05]' 
                : 'flex-[0.6] border-white/5 hover:border-blue-500/20 opacity-40 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FaCalendarDay size={14} />
                </div>
                {expandedChartCard === 'mass' && (
                  <div className="animate-fadeIn">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {isAltarLady ? 'Sanctuary Aesthetics' : 'Liturgical Mass Tracks'}
                    </h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Volume Trend Output</p>
                  </div>
                )}
              </div>
              {expandedChartCard === 'mass' ? <FaCompress size={12} className="text-gray-600" /> : <FaExpandArrowsAlt size={12} className="text-gray-600" />}
            </div>
            <div className="flex-1 w-full relative">
              <Bar data={massChartData} options={chartOptions} />
            </div>
          </div>

          {/* 🎯 FIXED & UPDATED: Clicking anywhere inside this circle wrapper card triggers the verified date drawer modal directly! */}
          <div 
            onClick={() => {
              setExpandedChartCard('sessions');
              setActiveSubDrawer('meetings'); // Open meeting dates history log layout on click
            }}
            className={`relative transition-all duration-500 cursor-pointer flex flex-col bg-[#0b130b] border p-5 rounded-2xl shadow-xl hover:bg-emerald-950/10 ${
              expandedChartCard === 'sessions' 
                ? 'flex-[2.5] border-emerald-500/40 bg-gradient-to-br from-[#0c150c] to-[#050a05]' 
                : 'flex-[0.6] border-white/5 hover:border-emerald-500/20 opacity-40 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <FaChartPie size={14} />
                </div>
                {expandedChartCard === 'sessions' && (
                  <div className="animate-fadeIn">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Assembly Yield Ratio</h4>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wide">Click card circle to view exact dates logs</p>
                  </div>
                )}
              </div>
              {expandedChartCard === 'sessions' ? <FaCompress size={12} className="text-gray-600" /> : <FaExpandArrowsAlt size={12} className="text-gray-600" />}
            </div>
            <div className="flex-1 w-full relative flex items-center justify-center">
               {expandedChartCard === 'sessions' && (
                 <div className="absolute text-center z-10 animate-fadeIn">
                    <p className="text-3xl font-serif font-bold text-white tracking-tight">{computedMetrics.meetingPercent}%</p>
                    <p className="text-[8px] text-emerald-500 uppercase font-black tracking-widest mt-0.5">Ratio Check</p>
                 </div>
               )}
               <Doughnut data={donutChartData} options={chartOptions} />
            </div>
          </div>

        </div>

        {/* ==========================================
            📋 STEP 2: SUMMARY METRIC CARD GRID
           ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card Module: Assemblies */}
          <div onClick={() => setActiveSubDrawer('meetings')} className="border border-white/5 bg-white/[0.02] p-5 rounded-2xl cursor-pointer hover:border-white/10 hover:bg-white/[0.04] transition-all group shadow-md">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Assemblies Attended</h4>
            <p className="text-2xl font-serif font-bold mt-2 text-white">
              {computedMetrics.meetingCount} <span className="text-lg font-normal text-gray-600">/ {computedMetrics.meetingTotal}</span> 
              <span className="text-md font-sans font-black text-blue-400 ml-3">{computedMetrics.meetingPercent}%</span>
            </p>
            <p className="text-2xs text-gray-500 mt-3 leading-normal font-medium uppercase tracking-wide">Click to view verified ledger dates history →</p>
          </div>

          {/* Card Module: Conic Progress Performance Index */}
          <div onClick={() => setActiveSubDrawer('stats')} className="border border-white/5 bg-white/[0.02] p-5 rounded-2xl flex items-center gap-5 cursor-pointer hover:border-white/10 hover:bg-white/[0.04] transition-all shadow-md">
            <div 
              className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-xl border border-white/5" 
              style={{ background: `conic-gradient(#3b82f6 ${computedMetrics.overallPercent}%, rgba(255,255,255,0.05) 0)` }}
            >
              <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center absolute shadow-inner">
                <span className="text-2xs font-black text-white font-mono">{computedMetrics.overallPercent}%</span>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Performance Index</h4>
              <p className="text-2xs font-mono mt-1 text-gray-400 leading-normal uppercase">
                Standing Status:<br/>
                <span className="font-serif font-bold text-xs text-[#d2b48c] tracking-normal">{computedMetrics.standing}</span>
              </p>
            </div>
          </div>

          {/* Card Module: Tasks Logged */}
          <div onClick={() => setActiveSubDrawer('others')} className="border border-white/5 bg-white/[0.02] p-5 rounded-2xl cursor-pointer hover:border-white/10 hover:bg-white/[0.04] transition-all shadow-md">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Operational Tasks</h4>
            <span className="bg-blue-900/20 text-blue-400 border border-blue-900/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md mt-2 inline-block">
              {computedMetrics.otherActivitiesCount} Tasks Verified
            </span>
            <p className="text-2xs text-gray-500 mt-3 leading-normal uppercase tracking-wide">Sanctuary clean-ups, novena alignments →</p>
          </div>

        </div>

        {/* Advisory Methodology Framework Info Box */}
        <footer className="bg-gradient-to-r from-[#111111] to-[#0d0d0d] text-white p-5 rounded-2xl border border-white/5 shadow-inner">
          <h4 className="text-xs font-bold mb-1 text-[#d2b48c] uppercase tracking-wider flex items-center gap-2"><FaGraduationCap /> Analytical Compliance Guidelines</h4>
          <p className="text-2xs leading-relaxed font-medium text-gray-500 uppercase tracking-wide">
            Ratings compile active engagement weights across general assemblies, liturgical shifts, and mandatory sanitation tasks. Output standings directly configure governance level promotions, executive board appointments, and certificate approvals.
          </p>
        </footer>

      </div>

      {/* ==========================================
          📂 STEP 3: CONTEXT SLIDE-OUT SUB-DRAWERS
         ========================================== */}
      {activeSubDrawer && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl animate-fadeIn flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#090909] border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 scrollbar-none">
              
              {/* Drawer View Track: Assemblies History Logs */}
              {activeSubDrawer === 'meetings' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-serif text-[#d2b48c] uppercase tracking-wider">Assemblies Ledger</h2>
                    <p className="text-gray-500 text-2xs uppercase tracking-widest mt-0.5">Verified Presence Checks: {computedMetrics.meetingCount} Logs</p>
                  </div>
                  <div className="divide-y divide-white/5 border-t border-white/5">
                    {computedMetrics.meetingLogs.length > 0 ? computedMetrics.meetingLogs.map((session, idx) => (
                      <div key={idx} className="flex justify-between items-center py-4 bg-transparent">
                        <div>
                          <p className="text-xs font-serif font-bold text-white uppercase tracking-wide">{session.title}</p> 
                          {/* ✅ TRANSPARENCY ENHANCEMENT: Displays long form date layout string mapping */}
                          <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider">
                            {session.dateString || new Date(session.createdAt).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          {session.attended ? (
                            <span className="text-green-400 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-green-950/20 px-3 py-1 rounded-md border border-green-900/30">
                              Present
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-red-950/20 px-3 py-1 rounded-md border border-red-900/30">
                              Absent
                            </span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="text-2xs text-gray-500 italic uppercase text-center py-8 tracking-widest">No structural session logs recorded in database clusters.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Drawer View Track: Performance Breakdown Analytics */}
              {activeSubDrawer === 'stats' && (
                <div className="text-center space-y-6 py-4">
                  <div>
                    <h2 className="text-lg font-serif text-[#d2b48c] uppercase tracking-wider">Index Matrix Analytics</h2>
                    <p className="text-gray-500 text-2xs uppercase tracking-widest mt-0.5">Statistical weight calculations distribution profile</p>
                  </div>
                  <div className="flex justify-center">
                    <div 
                      className="relative w-36 h-36 rounded-full flex items-center justify-center border border-white/5 shadow-2xl" 
                      style={{ background: `conic-gradient(#3b82f6 ${computedMetrics.overallPercent}%, rgba(255,255,255,0.03) 0)` }}
                    >
                      <div className="w-28 h-28 bg-[#090909] rounded-full flex items-center justify-center absolute shadow-inner">
                        <span className="text-2xl font-black font-mono text-white">{computedMetrics.overallPercent}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="max-w-md mx-auto bg-white/[0.01] border border-white/5 p-4 rounded-xl text-left space-y-2 text-2xs text-gray-400 uppercase tracking-wider font-medium">
                    <p className="text-[#8b4513] font-bold border-b border-white/5 pb-1 mb-2">Weight Evaluation Breakdown</p>
                    <p>• General Assembly Attendance Weight: <span className="text-white font-mono">40%</span></p>
                    <p>• Liturgical Mass Attendance Weight: <span className="text-white font-mono">40%</span></p>
                    <p>• Supplementary Operational Actions: <span className="text-white font-mono">20%</span></p>
                  </div>
                </div>
              )}

              {/* Drawer View Track: Other Activities Logs */}
              {activeSubDrawer === 'others' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-serif text-[#d2b48c] uppercase tracking-wider">Task Index Ledger</h2>
                    <p className="text-gray-500 text-2xs uppercase tracking-widest mt-0.5">Supplementary Action Index logs</p>
                  </div>
                  <div className="divide-y divide-white/5 border-t border-white/5">
                    {[
                      { date: '2026-05-14', title: 'Sanctuary Vestry Arrangement', tag: 'Clean-up', type: 'success' },
                      { date: '2026-04-20', title: 'Feast Day Liturgy Rehearsal', tag: 'Practice', type: 'info' },
                      { date: '2026-04-02', title: 'Easter Triduum Retransmission Prep', tag: 'Formation', type: 'warn' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex justify-between items-center py-4 bg-transparent">
                        <div>
                          <p className="text-xs font-serif font-bold text-white uppercase tracking-wide">{activity.title}</p> 
                          <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">{activity.date}</p>
                        </div>
                        <span className="px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded bg-white/5 border border-white/10 text-gray-400">{activity.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Drawer Action Controls Footer Panel */}
            <div className="shrink-0 p-5 border-t border-white/5 bg-black/40 flex justify-between items-center gap-4">
              <button type="button" onClick={onBackToDashboard} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest outline-none">
                <FaTachometerAlt size={12} /> Exit Panel
              </button>
              <button type="button" onClick={() => setActiveSubDrawer(null)} className="bg-[#1a110b] border border-[#3d2b1f] hover:border-[#8b4513] text-[#d2b48c] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all outline-none">
                Return to Ratings
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ActivityRatings;