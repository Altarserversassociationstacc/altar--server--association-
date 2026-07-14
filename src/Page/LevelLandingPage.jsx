/**
 * @file LevelLandingPage.jsx
 * @description Complete public/admin archive viewer featuring a grid-view layout for student records matching the Executive layout.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaEnvelope, 
  FaPhone, 
  FaUserGraduate, 
  FaFolderOpen, 
  FaChevronDown,
  FaUsers,
  FaExclamationTriangle
} from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';
const LEVEL_OPTIONS = ['100-Level', '200-Level', '300-Level', '400-Level', '500-Level', 'Alumni'];
const DEFAULT_AVATAR = 'https://via.placeholder.com/150?text=No+Photo';

/* ==========================================================================
   CUSTOM HOOKS & UTILITIES
   ========================================================================== */

const useDefaultSession = () => {
  return useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = now.getMonth() >= 7 ? currentYear : currentYear - 1;
    return {
      defaultSession: `${startYear}/${startYear + 1}`,
      latestStartYear: startYear
    };
  }, []);
};

const useLevelArchiveData = (session, level) => {
  const [data, setData] = useState({ groupPhoto: null, students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchArchiveData = async () => {
      setLoading(true);
      setError(null);

      try {
        const encodedSession = encodeURIComponent(session);
        const encodedLevel = encodeURIComponent(level);
        
        const [groupRes, studentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/levels/group-photo?year=${encodedSession}&level=${encodedLevel}`, { signal })
            .catch(err => err.name === 'CanceledError' ? Promise.reject(err) : ({ data: null })),
          axios.get(`${API_BASE_URL}/api/levels/students?year=${encodedSession}&level=${encodedLevel}`, { signal })
            .catch(err => err.name === 'CanceledError' ? Promise.reject(err) : ({ data: null }))
        ]);

        const groupPhoto = groupRes?.data?.success ? groupRes.data.data : null;
        const students = studentsRes?.data?.success && Array.isArray(studentsRes.data.data) 
          ? studentsRes.data.data 
          : [];

        setData({ groupPhoto, students });
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return;
        }
        console.error("Archive synchronization failed:", err);
        setError("Unable to synchronize archive records. Please try selecting the session again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArchiveData();

    return () => {
      controller.abort();
    };
  }, [session, level]);

  return { ...data, loading, error };
};

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

const ArchiveHeader = React.memo(({ selectedLevel, onLevelChange, selectedSession, onSessionChange, sessionOptions }) => (
  <header className="sticky top-0 z-40 bg-[#f8f5f2]/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#e6d5c3] dark:border-[#2a1b12] py-8 px-6 md:px-12 flex flex-col items-center gap-6 text-center transition-colors">
    <div className="flex flex-col items-center">
      <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#8b4513] tracking-tight flex items-center gap-2 whitespace-nowrap">
        <FaUsers className="text-[#8b4513]" aria-hidden="true" /> Level Archives
      </h1>
      <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
        Viewing {selectedLevel} Assembly • Session {selectedSession}
      </p>
    </div>

    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto" role="search" aria-label="Archive filters">
      <DropdownSelector
        icon={FaUserGraduate}
        value={selectedLevel}
        onChange={(e) => onLevelChange(e.target.value)}
        options={LEVEL_OPTIONS}
        ariaLabel="Select academic level"
      />
      <DropdownSelector
        icon={FaCalendarAlt}
        value={selectedSession}
        onChange={(e) => onSessionChange(e.target.value)}
        options={sessionOptions}
        ariaLabel="Select academic session"
      />
    </div>
  </header>
));

const DropdownSelector = React.memo(({ icon: Icon, value, onChange, options, ariaLabel }) => (
  <div className="relative w-full sm:w-auto">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b4513] pointer-events-none" aria-hidden="true" />
    <select 
      value={value} 
      onChange={onChange}
      aria-label={ariaLabel}
      className="w-full sm:w-48 bg-white dark:bg-[#111111] border border-[#e6d5c3] dark:border-[#2a1b12] text-sm text-[#8b4513] dark:text-[#d2b48c] rounded-xl pl-11 pr-4 py-3 outline-none appearance-none cursor-pointer focus:border-[#8b4513] transition-all font-medium shadow-inner"
    >
      {options.map(option => (
        <option key={option} value={option} className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">
          {option}
        </option>
      ))}
    </select>
    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b4513] pointer-events-none text-[10px]" aria-hidden="true" />
  </div>
));

const GroupPortraitHero = React.memo(({ groupPhoto, selectedLevel, selectedSession }) => {
  if (!groupPhoto) {
    return (
      <div className="w-full py-20 bg-white/60 dark:bg-[#111111]/40 border border-dashed border-[#e6d5c3] dark:border-[#2a1b12] rounded-[2.5rem] flex flex-col items-center justify-center text-center p-6 transition-colors">
        <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-bold">
          Official Group Portrait Pending
        </span>
        <p className="text-xs text-gray-400 mt-2 max-w-md">
          No class group photograph has been published for the {selectedLevel} ({selectedSession}) session yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="group relative w-full rounded-[2.5rem] overflow-hidden border border-[#e6d5c3] dark:border-[#2a1b12] shadow-2xl transition-all duration-700 hover:border-[#8b4513]/40">
        <img 
          src={groupPhoto.imageUrl} 
          alt={`Official ${selectedLevel} assembly portrait`}
          className="w-full h-auto object-contain transition-transform duration-1000"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 transition-colors pointer-events-none" />
        <div className="absolute bottom-10 left-10 space-y-2 pr-6 z-10">
          <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase bg-[#8b4513]/30 border border-[#8b4513]/50 text-[#d2b48c] px-4 py-1.5 rounded-full backdrop-blur-sm">
            Official Assembly
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-none">
            {selectedLevel} • {selectedSession}
          </h2>
          {groupPhoto.caption && (
            <p className="text-xs md:text-sm text-gray-300 max-w-2xl font-light italic mt-2">
              "{groupPhoto.caption}"
            </p>
          )}
        </div>
      </div>
      
      <div className="p-8 bg-white/60 dark:bg-[#111111]/40 border border-[#e6d5c3] dark:border-[#2a1b12] rounded-[2rem] max-w-4xl mx-auto text-center shadow-inner transition-colors">
        <h4 className="text-[#8b4513] text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Class Overview</h4>
        <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed italic font-light">
          {groupPhoto.description || `The ${selectedLevel} assembly for the ${selectedSession} academic year represents a dedicated cohort committed to academic excellence, liturgical service, and community leadership.`}
        </p>
      </div>
    </div>
  );
});

/* ==========================================================================
   GRID CARD COMPONENT (Matches Executive Layout)
   ========================================================================== */
const StudentCard = React.memo(({ student }) => {
  const handleImageError = useCallback((e) => {
    e.target.src = DEFAULT_AVATAR;
  }, []);

  const skillsList = useMemo(() => {
    if (Array.isArray(student.skills)) return student.skills;
    if (typeof student.skills === 'string') {
      return student.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [student.skills]);

  return (
    <div className="group bg-white dark:bg-[#111111]/60 border border-[#e6d5c3] dark:border-[#2a1b12] rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-500 hover:border-[#8b4513]/40">
      <div className="p-6 text-left">
        <div className="flex flex-col gap-4">
          
          {/* Top Section: Circular Profile Picture */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#8b4513]/40 shrink-0 shadow-2xl">
            <img
              src={student.imageUrl || DEFAULT_AVATAR}
              alt={student.fullName || 'Student'}
              onError={handleImageError}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Data Fields */}
          <div className="space-y-4">
            
            {/* Academic Data */}
            <div className="space-y-3">
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8b4513] border-b border-[#e6d5c3] dark:border-white/5 pb-1">Academic Data</p>
              <div className="grid gap-2">
                <p className="text-lg font-serif text-gray-900 dark:text-white tracking-tight">{student.fullName || 'Unnamed Student'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Level: <span className="text-gray-900 dark:text-white ml-2 font-serif text-base font-normal tracking-normal normal-case">{student.level || 'N/A'}</span></p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Session: <span className="text-[#8b4513] dark:text-[#d2b48c] ml-2 font-bold normal-case">{student.academicYear || 'N/A'}</span></p>
              </div>
            </div>

            {/* Origin & Residence */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8b4513] border-b border-[#e6d5c3] dark:border-white/5 pb-1">Origin & Residence</p>
              <div className="grid gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">State: <span className="text-gray-700 dark:text-gray-300 ml-2 font-normal normal-case">{student.state || 'N/A'}</span></p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Home: <span className="text-gray-700 dark:text-gray-300 ml-2 font-normal normal-case">{student.homeOfResidence || 'N/A'}</span></p>
              </div>
            </div>

            {/* Skills & Competencies */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8b4513] border-b border-[#e6d5c3] dark:border-white/5 pb-1">Skills & Profile</p>
              {skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skillsList.map((skill, index) => (
                    <span 
                      key={index}
                      className="text-[10px] font-medium bg-[#8b4513]/10 dark:bg-[#8b4513]/20 text-[#8b4513] dark:text-[#d2b48c] border border-[#8b4513]/20 px-2.5 py-1 rounded-lg tracking-wide whitespace-nowrap"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No skills listed</p>
              )}
            </div>

            {/* Contact Channels */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8b4513] border-b border-[#e6d5c3] dark:border-white/5 pb-1">Contact Channels</p>
              <div className="grid gap-2">
                {student.email ? (
                  <div className="flex items-center gap-3 group/link">
                    <FaEnvelope size={10} className="text-[#8b4513]" aria-hidden="true" />
                    <a href={`mailto:${student.email}`} className="text-xs text-gray-500 group-hover/link:text-[#d2b48c] transition-colors truncate">
                      {student.email}
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No email provided</p>
                )}
                
                {student.phoneNumber && (
                  <div className="flex items-center gap-3 group/link">
                    <FaPhone size={10} className="text-[#8b4513]" aria-hidden="true" />
                    <a href={`tel:${student.phoneNumber}`} className="text-xs text-gray-500 group-hover/link:text-[#d2b48c] transition-colors">
                      {student.phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

const EmptyRosterState = React.memo(({ selectedLevel, selectedSession }) => (
  <div className="w-full py-20 bg-white/60 dark:bg-[#111111]/30 border border-dashed border-[#e6d5c3] dark:border-[#2a1b12] rounded-3xl flex flex-col items-center justify-center text-center p-6 transition-colors">
    <div className="w-12 h-12 rounded-full bg-[#8b4513]/10 border border-[#8b4513]/20 flex items-center justify-center text-[#8b4513] mb-4">
      <FaFolderOpen size={20} aria-hidden="true" />
    </div>
    <h4 className="text-sm font-serif text-[#8b4513] dark:text-[#d2b48c] mb-1">
      No Archives Loaded Yet
    </h4>
    <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
      The student directory for {selectedLevel} ({selectedSession}) has not been populated by the administration yet.
    </p>
  </div>
));

/* ==========================================================================
   MAIN VIEW COMPONENT
   ========================================================================== */

export const LevelLandingPage = () => {
  const { defaultSession, latestStartYear } = useDefaultSession();
  
  const [selectedSession, setSelectedSession] = useState(defaultSession);
  const [selectedLevel, setSelectedLevel] = useState(LEVEL_OPTIONS[0]);

  const { groupPhoto, students, loading, error } = useLevelArchiveData(selectedSession, selectedLevel);

  const sessionOptions = useMemo(() => {
    return Array.from(
      { length: Math.max(1, latestStartYear - 2019) }, 
      (_, i) => `${latestStartYear - i}/${latestStartYear - i + 1}`
    );
  }, [latestStartYear]);

  return (
    <div id="level-archive" className="min-h-screen bg-[#f8f5f2] dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans antialiased selection:bg-[#8b4513]/30 selection:text-[#d2b48c] scroll-mt-24 transition-colors duration-500">
      
      <ArchiveHeader
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedSession={selectedSession}
        onSessionChange={setSelectedSession}
        sessionOptions={sessionOptions}
      />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4" role="status" aria-live="polite">
            <PulseLoader color="#8b4513" size={12} />
            <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">
              Synchronizing Archive Records...
            </span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-600 dark:text-red-400 max-w-2xl mx-auto text-sm" role="alert">
            <FaExclamationTriangle className="shrink-0 text-lg" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="space-y-12 mb-20">
              <GroupPortraitHero 
                groupPhoto={groupPhoto} 
                selectedLevel={selectedLevel} 
                selectedSession={selectedSession} 
              />
              
              <div className="border-b border-[#e6d5c3] dark:border-[#2a1b12] w-full opacity-30 shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-colors"></div>
            </div>

            <section aria-labelledby="roster-heading" className="space-y-12">
              <div className="border-b border-[#e6d5c3] dark:border-[#2a1b12] pb-4 transition-colors flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h3 id="roster-heading" className="text-2xl font-serif text-[#8b4513] dark:text-[#d2b48c] tracking-wide">
                    {selectedLevel} Student Directory
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                    Grid Directory View
                  </p>
                </div>
                
                {students.length > 0 && (
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-[#8b4513]/10 border border-[#8b4513]/20 text-[#8b4513] dark:text-[#d2b48c] px-4 py-1.5 rounded-full w-fit">
                    {students.length} Registered
                  </span>
                )}
              </div>

              {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {students.map((student) => (
                    <StudentCard key={student._id || student.id} student={student} />
                  ))}
                </div>
              ) : (
                <EmptyRosterState selectedLevel={selectedLevel} selectedSession={selectedSession} />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default LevelLandingPage;