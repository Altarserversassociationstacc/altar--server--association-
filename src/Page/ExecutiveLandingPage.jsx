import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaEnvelope, FaPhone, FaUserTie, FaFolderOpen, FaChevronDown } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

export const ExecutiveLandingPage = () => {
  // Compute automated default academic session bounds dynamically based on current timeline
  const now = new Date();
  const currentYear = now.getFullYear();
  const defaultSession = now.getMonth() >= 7 // August (index 7) or later starts the new session
    ? `${currentYear}/${currentYear + 1}`
    : `${currentYear - 1}/${currentYear}`;

  const [selectedSession, setSelectedSession] = useState(defaultSession);
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate a dynamic list of past academic sessions stretching back to the department's launch
  const generateSessionOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Dynamically calculate the latest session year so it doesn't break after 2025
    const latestStartYear = now.getMonth() >= 7 ? currentYear : currentYear - 1;
    const startYear = latestStartYear - 10;
    const options = [];
    for (let i = latestStartYear; i >= startYear; i--) {
      options.push(`${i}/${i + 1}`);
    }
    return options;
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchSessionData = async () => {
      setLoading(true);
      try {
        const encodedSession = encodeURIComponent(selectedSession);
        
        // Simultaneous parallel dispatch requests to eliminate cascading waterfall latency over slow connections
        const [groupRes, execsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/executives/group-photo?year=${encodedSession}`).catch(() => ({ data: null })),
          axios.get(`${API_BASE_URL}/api/executives?year=${encodedSession}&group=false`).catch(() => ({ data: null }))
        ]);

        if (isMounted) {
          // Drill down into group portrait standard envelope structure securely
          if (groupRes.data && groupRes.data.success) {
            setGroupPhoto(groupRes.data.data);
          } else {
            setGroupPhoto(null);
          }

          // Drill down into individual list envelope structure safely
          if (execsRes.data && execsRes.data.success && Array.isArray(execsRes.data.data)) {
            setExecutives(execsRes.data.data);
          } else {
            setExecutives([]);
          }
        }
      } catch (err) {
        console.error("Failed to sync session dataset framework components:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSessionData();
    return () => { isMounted = false; };
  }, [selectedSession]);

  return (
    <div id="executives-archive" className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased selection:bg-[#8b4513]/30 selection:text-[#d2b48c] scroll-mt-24">
      
      {/* Dynamic Header Controls Bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#2a1b12] py-8 px-6 md:px-12 flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-serif font-bold text-[#d2b48c] tracking-tight flex items-center gap-3">
            <FaUserTie className="text-[#8b4513]" /> Executive Team
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
            Meet the dedicated leaders driving ASA forward. Academic Session {selectedSession} Executive Council
          </p>
        </div>

        {/* Zero-Hardcoded Automated Dropdown Selector */}
        <div className="relative w-full sm:w-auto">
          <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b4513] pointer-events-none" />
          <select 
            value={selectedSession} 
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full sm:w-48 bg-[#111111] border border-[#2a1b12] text-sm text-[#d2b48c] rounded-xl pl-11 pr-4 py-3 outline-none appearance-none cursor-pointer focus:border-[#8b4513] transition-all font-medium shadow-inner"
          >
            {generateSessionOptions().map(session => (
              <option key={session} value={session} className="bg-[#111111] text-white">{session}</option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b4513] pointer-events-none text-[10px]" />
        </div>
      </div>

      {/* Main Presentation Screen */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <PulseLoader color="#8b4513" size={12} />
            <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Synchronizing Archive Data</span>
          </div>
        ) : (
          <>
            {/* 1. Official Session Group Banner at the Top */}
            <div className="space-y-12 mb-20">
              {groupPhoto ? (
                <div className="space-y-10">
                  <div className="group relative w-full rounded-[2.5rem] overflow-hidden border border-[#2a1b12] shadow-2xl transition-all duration-700 hover:border-[#8b4513]/40">
                    <img 
                      src={groupPhoto.imageUrl} 
                      alt={`Official group portrait`}
                      className="w-full h-auto object-contain transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-10 left-10 space-y-2">
                      <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-[#8b4513]/30 border border-[#8b4513]/50 text-[#d2b48c] px-4 py-1.5 rounded-full backdrop-blur-sm">
                        Official Session Assembly
                      </span>
                      <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-none">
                        Academic Session {selectedSession}
                        {groupPhoto.executiveName ? ` - ${groupPhoto.executiveName}` : ''}
                      </h2>
                    </div>
                  </div>
                  <div className="p-8 bg-[#111111]/40 border border-[#2a1b12] rounded-[2rem] max-w-4xl mx-auto text-center shadow-inner">
                     <h4 className="text-[#8b4513] text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Council Narrative</h4>
                     <p className="text-gray-400 text-sm leading-relaxed italic font-light">
                       The {selectedSession} Executive Council leads with a focus on liturgical excellence and fraternal growth within the sanctuary.
                     </p>
                  </div>
                </div>
              ) : (
                <div className="w-full py-20 bg-[#111111]/40 border border-dashed border-[#2a1b12] rounded-[2.5rem] flex items-center justify-center text-gray-600 text-xs uppercase tracking-[0.3em] font-bold">
                  Official Group Portrait Pending
                </div>
              )}

              {/* Demarcation Line */}
              <div className="border-b border-[#2a1b12] w-full opacity-30 shadow-[0_1px_2px_rgba(0,0,0,0.5)]"></div>
            </div>

            {/* 2. Individual Cabinet Grid below */}
            <div className="space-y-12">
              <div className="border-b border-[#2a1b12] pb-4">
                <h3 className="text-2xl font-serif text-[#d2b48c] tracking-wide">Executive Cabinet Board</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Officers of the Association</p>
              </div>

              {executives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {executives.map((exec) => (
                    <div 
                      key={exec._id} 
                      className="group bg-[#111111]/60 border border-[#2a1b12] rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-500 hover:border-[#8b4513]/40"
                    >
                      <div className="p-6 text-left">
                        <div className="flex flex-col gap-4">
                          {/* Top Section: Circular Profile Picture */}
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#8b4513]/40 shrink-0 shadow-2xl">
                            <img
                              src={exec.imageUrl}
                              alt={exec.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Administrative Metadata Fields */}
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8b4513] border-b border-white/5 pb-1">Council Data</p>
                              
                              <div className="grid gap-2">
                                <p className="text-lg font-serif text-white tracking-tight">{exec.executiveName}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Name: <span className="text-white ml-2 font-serif text-base font-normal tracking-normal normal-case">{exec.name?.toUpperCase()}</span></p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Department: <span className="text-gray-300 ml-2 font-normal normal-case">{exec.department}</span></p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Position: <span className="text-[#d2b48c] ml-2 font-bold normal-case">{exec.position}</span></p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8b4513] border-b border-white/5 pb-1">Bio Profile</p>
                              <p className="text-xs text-gray-400 leading-relaxed font-light italic">
                                "{exec.bio}"
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8b4513] border-b border-white/5 pb-1">Contact Channels</p>
                              <div className="grid gap-2">
                                <div className="flex items-center gap-3 group/link">
                                  <FaEnvelope size={10} className="text-[#8b4513]" />
                                  <a href={`mailto:${exec.email}`} className="text-xs text-gray-500 group-hover/link:text-[#d2b48c] transition-colors truncate">{exec.email}</a>
                                </div>
                                <div className="flex items-center gap-3 group/link">
                                  <FaPhone size={10} className="text-[#8b4513]" />
                                  <a href={`tel:${exec.phoneNumber}`} className="text-xs text-gray-500 group-hover/link:text-[#d2b48c] transition-colors">{exec.phoneNumber}</a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full py-20 bg-[#111111]/30 border border-dashed border-[#2a1b12] rounded-3xl flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-[#8b4513]/10 border border-[#8b4513]/20 flex items-center justify-center text-[#8b4513] mb-4">
                    <FaFolderOpen size={20} />
                  </div>
                  <h4 className="text-sm font-serif text-[#d2b48c] mb-1">No Archives Loaded Yet</h4>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                    The administrative records for the {selectedSession} session have not been initialized by the panel auditor.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};