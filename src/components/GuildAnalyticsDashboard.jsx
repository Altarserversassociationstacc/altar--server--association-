// import React, { useState } from 'react';
// import { Bar, Doughnut } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';
// import { 
//   FaChartPie, FaCalendarDay, FaExpandArrowsAlt, FaCompress,
//   FaChurch, FaUsers, FaTshirt, FaCheck, FaTimes
// } from 'react-icons/fa';

// ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// const GuildAnalyticsDashboard = ({ metrics = {} }) => {
//   const [expandedCard, setExpandedCard] = useState('sessions');

//   const toggleExpand = (cardId) => {
//     setExpandedCard(expandedCard === cardId ? null : cardId);
//   };

//   // ==========================================
//   // 🧠 BULLETPROOF METRICS EXTRACTION
//   // ==========================================
//   // Meetings
//   const meetingsAttended = Number(
//     metrics?.meetingsAttended ?? metrics?.meetingCount ?? metrics?.meetingsCount ?? 0
//   );
//   const meetingsMissed = Number(
//     metrics?.meetingsMissed ?? metrics?.meetingMissed ?? Math.max(0, (metrics?.meetingsTotal ?? metrics?.meetingTotal ?? 0) - meetingsAttended)
//   );
//   const meetingsTotal = Number(
//     metrics?.meetingsTotal ?? metrics?.meetingTotal ?? (meetingsAttended + meetingsMissed)
//   );

//   // Practices
//   const practicesAttended = Number(
//     metrics?.practicesAttended ?? metrics?.practiceCount ?? metrics?.practicesCount ?? 0
//   );
//   const practicesMissed = Number(
//     metrics?.practicesMissed ?? metrics?.practiceMissed ?? Math.max(0, (metrics?.practicesTotal ?? metrics?.practiceTotal ?? 0) - practicesAttended)
//   );
//   const practicesTotal = Number(
//     metrics?.practicesTotal ?? metrics?.practiceTotal ?? (practicesAttended + practicesMissed)
//   );

//   // Cloth Washing
//   const washingsAttended = Number(
//     metrics?.washingsAttended ?? metrics?.clothWashingCount ?? metrics?.washingCount ?? metrics?.washingsCount ?? 0
//   );
//   const washingsMissed = Number(
//     metrics?.washingsMissed ?? metrics?.clothWashingMissed ?? metrics?.washingMissed ?? Math.max(0, (metrics?.washingsTotal ?? metrics?.clothWashingTotal ?? metrics?.washingTotal ?? 0) - washingsAttended)
//   );
//   const washingsTotal = Number(
//     metrics?.washingsTotal ?? metrics?.clothWashingTotal ?? metrics?.washingTotal ?? (washingsAttended + washingsMissed)
//   );

//   // Masses
//   const masses = Number(metrics?.massesCount ?? metrics?.massCount ?? 0);

//   // Aggregates
//   const totalAttended = meetingsAttended + practicesAttended + washingsAttended;
//   const totalMissed = meetingsMissed + practicesMissed + washingsMissed;
//   const totalSessionsHeld = Number(metrics?.totalSessions ?? (totalAttended + totalMissed));
//   const overallPercent = totalSessionsHeld > 0 ? Math.round((totalAttended / totalSessionsHeld) * 100) : 0;

//   const isDoughnutEmpty = totalSessionsHeld === 0;

//   // ==========================================
//   // 📊 CHART CONFIGURATIONS
//   // ==========================================
//   const massChartData = {
//     labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Total'],
//     datasets: [{
//       label: 'Mass Attendance',
//       data: [
//         Math.floor(masses * 0.2),
//         Math.floor(masses * 0.4),
//         Math.floor(masses * 0.6),
//         Math.floor(masses * 0.8),
//         masses
//       ],
//       backgroundColor: '#d2b48c',
//       hoverBackgroundColor: '#e5cdad',
//       borderRadius: 6,
//       barThickness: expandedCard === 'mass' ? 18 : 6, 
//     }]
//   };

//   // 6-Slice Success vs Failure Track
//   const donutChartData = {
//     labels: isDoughnutEmpty 
//       ? ['No Data'] 
//       : [
//           'Meeting (Attended)', 'Meeting (Missed)',
//           'Practice (Attended)', 'Practice (Missed)',
//           'Washing (Attended)', 'Washing (Missed)'
//         ],
//     datasets: [{
//       data: isDoughnutEmpty 
//         ? [1] 
//         : [
//             meetingsAttended, meetingsMissed,
//             practicesAttended, practicesMissed,
//             washingsAttended, washingsMissed
//           ], 
//       backgroundColor: isDoughnutEmpty 
//         ? ['rgba(255, 255, 255, 0.05)'] 
//         : [
//             '#3b82f6', '#1e3a8a', // Meeting (Blue: Attended vs Missed)
//             '#a855f7', '#581c87', // Practice (Purple: Attended vs Missed)
//             '#f59e0b', '#78350f'  // Cloth Washing (Amber: Attended vs Missed)
//           ],
//       hoverBackgroundColor: isDoughnutEmpty
//         ? ['rgba(255, 255, 255, 0.05)']
//         : [
//             '#60a5fa', '#ef4444', 
//             '#c084fc', '#ef4444',
//             '#fbbf24', '#ef4444'
//           ],
//       borderColor: isDoughnutEmpty ? ['transparent'] : Array(6).fill('#111111'),
//       borderWidth: isDoughnutEmpty ? 0 : 2,
//       hoverOffset: isDoughnutEmpty ? 0 : 6,
//       cutout: '74%'
//     }]
//   };

//   const getChartOptions = (cardId) => ({ 
//     responsive: true, 
//     maintainAspectRatio: false, 
//     plugins: { 
//       legend: { display: false },
//       tooltip: {
//         enabled: expandedCard === cardId && !isDoughnutEmpty,
//         backgroundColor: '#0c0c0c',
//         titleColor: '#d2b48c',
//         bodyColor: '#ffffff',
//         titleFont: { size: 11, weight: 'bold' },
//         bodyFont: { size: 11 },
//         padding: 10,
//         cornerRadius: 8,
//         displayColors: true,
//         borderColor: 'rgba(210, 180, 140, 0.2)',
//         borderWidth: 1,
//         callbacks: {
//           label: function(context) {
//             const label = context.label || '';
//             const value = context.parsed || 0;
//             return ` ${label}: ${value} session${value === 1 ? '' : 's'}`;
//           }
//         }
//       }
//     },
//     scales: {
//       x: { 
//         display: expandedCard === cardId && cardId === 'mass', 
//         grid: { display: false }, 
//         ticks: { color: '#6b7280', font: { size: 10 } } 
//       },
//       y: { 
//         display: expandedCard === cardId && cardId === 'mass', 
//         grid: { color: 'rgba(255, 255, 255, 0.04)' }, 
//         ticks: { color: '#6b7280', font: { size: 10 } } 
//       }
//     }
//   });

//   const renderActivityScore = (title, icon, attended, missed, total, colorClass, borderClass) => {
//     const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
//     return (
//       <div className={`bg-black/40 border ${borderClass} p-3 rounded-2xl flex items-center justify-between`}>
//         <div className="flex items-center gap-2.5">
//           <div className={`p-2 rounded-xl ${colorClass}`}>
//             {icon}
//           </div>
//           <div>
//             <h5 className="text-[10px] font-black uppercase tracking-wider text-white">{title}</h5>
//             <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono font-bold">
//               <span className="text-emerald-400 flex items-center gap-0.5"><FaCheck size={8}/> {attended}</span>
//               <span className="text-gray-600">|</span>
//               <span className="text-red-400 flex items-center gap-0.5"><FaTimes size={8}/> {missed}</span>
//             </div>
//           </div>
//         </div>
//         <div className="text-right font-mono">
//           <span className={`text-xs font-black ${pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
//             {pct}%
//           </span>
//           <span className="block text-[8px] uppercase tracking-widest text-gray-500">Yield</span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col md:flex-row gap-4 my-6 h-auto md:h-[420px] w-full transition-all duration-700 ease-in-out">
      
//       {/* 🏛️ 1. MASS ATTENDANCE CARD */}
//       <div 
//         onClick={() => toggleExpand('mass')}
//         className={`relative transition-all duration-700 cursor-pointer group flex flex-col bg-[#111111] border rounded-3xl p-5 md:p-6 shadow-2xl ${
//           expandedCard === 'mass' 
//             ? 'flex-[4] md:flex-[2.5] border-[#d2b48c]/40 bg-gradient-to-br from-[#111111] via-[#161616] to-[#0c0c0c] min-h-[300px]' 
//             : 'flex-[1] md:flex-[0.6] border-white/5 hover:border-[#d2b48c]/20 opacity-80 hover:opacity-100 min-h-[120px]'
//         }`}
//       >
//         <div className="flex items-center justify-between mb-4">
//           <div className={`flex items-center gap-3 ${expandedCard !== 'mass' ? 'md:flex-col md:mx-auto' : ''}`}>
//             <div className="p-3 bg-[#d2b48c]/10 border border-[#d2b48c]/20 rounded-2xl text-[#d2b48c]">
//               <FaCalendarDay size={16} />
//             </div>
//             {expandedCard === 'mass' ? (
//               <div className="animate-fadeIn">
//                 <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white">Mass Attendance</h4>
//                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Cumulative Progress</p>
//               </div>
//             ) : (
//               <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-gray-500 [writing-mode:vertical-lr] rotate-180 mt-2">
//                 Mass History
//               </span>
//             )}
//           </div>
//           {expandedCard === 'mass' ? <FaCompress className="text-gray-500 hover:text-white transition-colors" size={12} /> : <FaExpandArrowsAlt className="text-gray-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity" size={12} />}
//         </div>

//         <div className="flex-1 w-full relative min-h-[180px]">
//           <Bar data={massChartData} options={getChartOptions('mass')} />
//         </div>
//       </div>

//       {/* 📊 2. SESSION ANALYTICS CARD (SUCCESS vs FAILURE PIE) */}
//       <div 
//         onClick={() => toggleExpand('sessions')}
//         className={`relative transition-all duration-700 cursor-pointer group flex flex-col bg-[#111111] border rounded-3xl p-5 md:p-6 shadow-2xl ${
//           expandedCard === 'sessions' 
//             ? 'flex-[4] md:flex-[3.5] border-[#d2b48c]/40 bg-gradient-to-br from-[#111111] via-[#161616] to-[#0c0c0c] min-h-[380px]' 
//             : 'flex-[1] md:flex-[0.6] border-white/5 hover:border-[#d2b48c]/20 opacity-80 hover:opacity-100 min-h-[120px]'
//         }`}
//       >
//         <div className="flex items-center justify-between mb-4">
//           <div className={`flex items-center gap-3 ${expandedCard !== 'sessions' ? 'md:flex-col md:mx-auto' : ''}`}>
//             <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
//               <FaChartPie size={16} />
//             </div>
//             {expandedCard === 'sessions' ? (
//               <div className="animate-fadeIn">
//                 <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white">Success vs Failure Track</h4>
//                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Meeting | Practice | Cloth Washing</p>
//               </div>
//             ) : (
//               <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-gray-500 [writing-mode:vertical-lr] rotate-180 mt-2">
//                 Yield Ratio
//               </span>
//             )}
//           </div>
//           {expandedCard === 'sessions' ? <FaCompress className="text-gray-500 hover:text-white transition-colors" size={12} /> : <FaExpandArrowsAlt className="text-gray-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity" size={12} />}
//         </div>

//         {/* Chart + Scorecard Container */}
//         <div className={`flex-1 w-full flex ${expandedCard === 'sessions' ? 'flex-col lg:flex-row items-center gap-6' : 'items-center justify-center'}`}>
          
//           {/* Doughnut Chart Section */}
//           <div className="relative flex-1 w-full h-[200px] md:h-[220px] flex items-center justify-center">
//             {expandedCard === 'sessions' && !isDoughnutEmpty && (
//               <div className="absolute text-center z-10 animate-fadeIn pointer-events-none">
//                 <p className={`text-3xl font-serif font-bold tracking-tight ${overallPercent >= 75 ? 'text-emerald-400' : overallPercent >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
//                   {overallPercent}%
//                 </p>
//                 <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Total Yield</p>
//               </div>
//             )}
//             <Doughnut data={donutChartData} options={getChartOptions('sessions')} />
//           </div>

//           {/* 📋 Expanded Activity Scorecard Breakdown */}
//           {expandedCard === 'sessions' && !isDoughnutEmpty && (
//             <div className="w-full lg:w-[240px] flex flex-col gap-2.5 animate-fadeIn border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
//               <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 mb-1 block">Activity Audit</span>
//               {renderActivityScore('Meetings', <FaChurch size={12} />, meetingsAttended, meetingsMissed, meetingsTotal, 'bg-blue-950 text-blue-400', 'border-blue-900/30')}
//               {renderActivityScore('Practices', <FaUsers size={12} />, practicesAttended, practicesMissed, practicesTotal, 'bg-purple-950 text-purple-400', 'border-purple-900/30')}
//               {renderActivityScore('Cloth Washing', <FaTshirt size={12} />, washingsAttended, washingsMissed, washingsTotal, 'bg-amber-950 text-amber-400', 'border-amber-900/30')}
//             </div>
//           )}

//         </div>
//       </div>

//     </div>
//   );
// };

// export default GuildAnalyticsDashboard;