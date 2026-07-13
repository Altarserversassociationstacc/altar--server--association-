import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaEnvelope, 
  FaPhone, 
  FaUserGraduate, 
  FaFolderOpen, 
  FaChevronDown,
  FaIdCard,
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

/**
 * Computes the default academic session based on the current month.
 * Academic years typically roll over around August (Month index 7).
 */
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

/**
 * Custom hook to handle parallel fetching of group portraits and student rosters
 * with automatic request cancellation on dependency changes.
 */
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
          axios.get(`${API_BASE_URL}/api/students?year=${encodedSession}&level=${encodedLevel}`, { signal })
            .catch(err => err.name === 'CanceledError' ? Promise.reject(err) : ({ data: null }))
        ]);

        const groupPhoto = groupRes?.data?.success ? groupRes.data.data : null;
        const students = studentsRes?.data?.success && Array.isArray(studentsRes.data.data) 
          ? studentsRes.data.data 
          : [];

        setData({ groupPhoto, students });
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return; // Suppress state updates for aborted requests
        }
        console.error("Archive synchronization failed:", err);
        setError("Unable to synchronize archive records. Please try selecting the session again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArchiveData();

    return () => {
      controller.abort(); // Cancel pending network requests if component unmounts or props change
    };
  }, [session, level]);

  return { ...data, loading, error };
};

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

const ArchiveHeader = React.memo(({ 
  selectedLevel, 
  onLevelChange, 
  selectedSession, 
  onSessionChange, 
  sessionOptions 
}) => (
  <header className="sticky top-0 z-40 bg-[#f8f5f2]/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#e6d5c3] dark:border-[#2a1b12] py-6 px-6 md:px-12 transition-colors">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#8b4513] tracking-tight flex items-center justify-center md:justify-start gap-3">
          <FaUsers aria-hidden="true" /> Level Archives
        </h1>
        <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">
          Viewing {selectedLevel} Assembly • Session {selectedSession}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto" role="search" aria-label="Archive filters">
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

    </div>
  </header>
));

const DropdownSelector = React.memo(({ icon: Icon, value, onChange, options, ariaLabel }) => (
  <div className="relative w-full sm:w-48">
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b4513] pointer-events-none text-sm" aria-hidden="true" />
    <select 
      value={value} 
      onChange={onChange}
      aria-label={ariaLabel}
      className="w-full bg-white dark:bg-[#111111] border border-[#e6d5c3] dark:border-[#2a1b12] text-xs text-[#8b4513] dark:text-[#d2b48c] rounded-xl pl-10 pr-8 py-3 outline-none appearance-none cursor-pointer focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513] transition-all font-medium shadow-sm"
    >
      {options.map(option => (
        <option key={option} value={option} className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">
          {option}
        </option>
      ))}
    </select>
    <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b4513] pointer-events-none text-[10px]" aria-hidden="true" />
  </div>
));

const GroupPortraitHero = React.memo(({ groupPhoto, selectedLevel, selectedSession }) => {
  if (!groupPhoto) {
    return (
      <div className="w-full py-16 bg-white/60 dark:bg-[#111111]/40 border border-dashed border-[#e6d5c3] dark:border-[#2a1b12] rounded-[2rem] flex flex-col items-center justify-center text-center p-6 transition-colors">
        <span className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">
          Official Group Portrait Pending
        </span>
        <p className="text-xs text-gray-400 mt-1.5 max-w-md">
          No class group photograph has been published for the {selectedLevel} ({selectedSession}) session yet.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Class Group Portrait" className="space-y-8">
      <div className="group relative w-full rounded-[2rem] overflow-hidden border border-[#e6d5c3] dark:border-[#2a1b12] shadow-xl bg-black/5">
        <img 
          src={groupPhoto.imageUrl} 
          alt={`Official ${selectedLevel} assembly portrait for ${selectedSession}`}
          className="w-full h-auto max-h-[550px] object-cover transition-transform duration-700 group-hover:scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 space-y-2 pr-6 z-10">
          <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase bg-[#8b4513]/80 border border-[#8b4513] text-[#d2b48c] px-3.5 py-1 rounded-full backdrop-blur-md">
            Official Assembly
          </span>
          <h2 className="text-2xl md:text-4xl font-serif text-white tracking-tight leading-none font-bold">
            {selectedLevel} • {selectedSession}
          </h2>
          {groupPhoto.caption && (
            <p className="text-xs md:text-sm text-gray-300 max-w-2xl font-light italic">
              "{groupPhoto.caption}"
            </p>
          )}
        </div>
      </div>
      
      <div className="p-6 md:p-8 bg-white/70 dark:bg-[#111111]/60 border border-[#e6d5c3] dark:border-[#2a1b12] rounded-2xl max-w-4xl mx-auto text-center shadow-sm">
        <h3 className="text-[#8b4513] text-[10px] font-bold uppercase tracking-[0.25em] mb-2">Class Overview</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-light italic">
          {groupPhoto.description || `The ${selectedLevel} assembly for the ${selectedSession} academic year represents a dedicated cohort committed to academic excellence, liturgical service, and community leadership.`}
        </p>
      </div>
    </section>
  );
});

const StudentCard = React.memo(({ student }) => {
  const handleImageError = useCallback((e) => {
    e.target.src = DEFAULT_AVATAR;
  }, []);

  return (
    <article className="group bg-white dark:bg-[#111111]/80 border border-[#e6d5c3] dark:border-[#2a1b12] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:border-[#8b4513]/50 flex flex-col justify-between">
      <div className="p-6">
        
        {/* Header: Avatar & Basic Info */}
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#8b4513]/30 shrink-0 bg-gray-100 dark:bg-gray-800">
            <img
              src={student.imageUrl || DEFAULT_AVATAR}
              alt={`Avatar of ${student.name}`}
              onError={handleImageError}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-base font-serif text-gray-900 dark:text-white font-bold truncate" title={student.name}>
              {student.name}
            </h4>
            <p className="text-xs text-[#8b4513] dark:text-[#d2b48c] font-medium truncate">
              {student.department || 'General Studies'}
            </p>
          </div>
        </div>

        {/* Academic Metadata */}
        <div className="space-y-2 mb-4">
          <span className="block text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-500">
            Academic Record
          </span>
          <div className="grid gap-1 text-xs bg-[#f8f5f2]/60 dark:bg-white/[0.02] p-3 rounded-xl border border-[#e6d5c3]/40 dark:border-[#2a1b12]">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                <FaIdCard className="text-[#8b4513]" aria-hidden="true" /> Matric No:
              </span>
              <span className="font-mono text-gray-800 dark:text-gray-200 font-bold text-[11px]">
                {student.matricNumber || student.studentId || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-500 font-semibold uppercase text-[9px]">Status:</span>
              <span className="text-green-700 dark:text-green-400 font-medium text-[10px] bg-green-500/10 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {student.bio && (
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-500">
              About
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light italic line-clamp-2">
              "{student.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Contact Channels Footer */}
      <footer className="px-6 py-3.5 bg-[#f8f5f2]/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-[#2a1b12] flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2.5 truncate">
          <FaEnvelope className="text-[#8b4513] shrink-0 text-[10px]" aria-hidden="true" />
          {student.email ? (
            <a href={`mailto:${student.email}`} className="text-gray-600 dark:text-gray-400 hover:text-[#8b4513] dark:hover:text-[#d2b48c] transition-colors truncate">
              {student.email}
            </a>
          ) : (
            <span className="text-gray-400 italic">No email provided</span>
          )}
        </div>
        {student.phoneNumber && (
          <div className="flex items-center gap-2.5 truncate">
            <FaPhone className="text-[#8b4513] shrink-0 text-[10px]" aria-hidden="true" />
            <a href={`tel:${student.phoneNumber}`} className="text-gray-600 dark:text-gray-400 hover:text-[#8b4513] dark:hover:text-[#d2b48c] transition-colors">
              {student.phoneNumber}
            </a>
          </div>
        )}
      </footer>
    </article>
  );
});

const EmptyRosterState = React.memo(({ selectedLevel, selectedSession }) => (
  <div className="w-full py-16 bg-white/60 dark:bg-[#111111]/30 border border-dashed border-[#e6d5c3] dark:border-[#2a1b12] rounded-3xl flex flex-col items-center justify-center text-center p-6 transition-colors">
    <div className="w-12 h-12 rounded-full bg-[#8b4513]/10 border border-[#8b4513]/20 flex items-center justify-center text-[#8b4513] mb-3">
      <FaFolderOpen size={18} aria-hidden="true" />
    </div>
    <h4 className="text-base font-serif text-[#8b4513] dark:text-[#d2b48c] font-bold mb-1">
      No Student Records Found
    </h4>
    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
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

  // Memoize historical session options from current timeline back to 2020
  const sessionOptions = useMemo(() => {
    return Array.from(
      { length: Math.max(1, latestStartYear - 2019) }, 
      (_, i) => `${latestStartYear - i}/${latestStartYear - i + 1}`
    );
  }, [latestStartYear]);

  return (
    <div id="level-archive" className="min-h-screen bg-[#f8f5f2] dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans antialiased selection:bg-[#8b4513]/30 selection:text-[#d2b48c] transition-colors duration-500">
      
      <ArchiveHeader
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedSession={selectedSession}
        onSessionChange={setSelectedSession}
        sessionOptions={sessionOptions}
      />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-14">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4" role="status" aria-live="polite">
            <PulseLoader color="#8b4513" size={10} />
            <span className="text-[11px] uppercase text-gray-500 tracking-widest font-bold">
              Synchronizing Archive Records...
            </span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-600 dark:text-red-400 max-w-2xl mx-auto text-sm" role="alert">
            <FaExclamationTriangle className="shrink-0 text-lg" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <GroupPortraitHero 
              groupPhoto={groupPhoto} 
              selectedLevel={selectedLevel} 
              selectedSession={selectedSession} 
            />

            <hr className="border-[#e6d5c3] dark:border-[#2a1b12] opacity-50" />

            {/* Roster Grid Section */}
            <section aria-labelledby="roster-heading" className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#e6d5c3] dark:border-[#2a1b12] pb-4">
                <div>
                  <h3 id="roster-heading" className="text-xl md:text-2xl font-serif text-[#8b4513] dark:text-[#d2b48c] font-bold tracking-wide">
                    {selectedLevel} Student Roster
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                    Directory & Individual Profiles
                  </p>
                </div>
                
                {students.length > 0 && (
                  <span className="text-xs font-semibold text-[#8b4513] bg-[#8b4513]/10 border border-[#8b4513]/20 px-3.5 py-1 rounded-full w-fit">
                    {students.length} {students.length === 1 ? 'Student' : 'Students'} Registered
                  </span>
                )}
              </div>

              {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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