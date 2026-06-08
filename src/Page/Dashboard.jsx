import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaMoneyBillWave, FaEnvelope, FaCommentDots, FaWhatsapp, 
  FaTrash, FaSignOutAlt, FaUserCircle, FaBars, FaTimes, 
  FaChevronDown, FaTachometerAlt, FaUser, FaBook, FaTasks, 
  FaLock, FaMoon, FaSun, FaAward, FaChurch, FaCalendarCheck,
  FaUsers
} from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';
import { useTheme } from '../context/ThemeContext.jsx';

import altarLogo from '../assets/logo.png';

// Component Sub-layer Imports
import Correspondence from './Correspondence';
import Settings from './Settings';
import Community from './Community';
import Feedback from './Feedback';
import Missa from './Missa';
import Rosary from './Rosary';
import MassSelection from './MassSelection';
import LiturgicalCalendar from './LiturgicalCalendar';
import MembershipLockModal from '../components/MembershipLockModal';
import ActivityRatings from '../Page/ActivityRatings';
import GuildAnalyticsDashboard from '../components/GuildAnalyticsDashboard';
import StudentPersonalLedger from '../Page/StudentPersonalLedger.jsx'; 
import PaymentPortal from './PaymentPortal.jsx';

// Configuration Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';
const BREAKPOINT_MD = 768;
const VIEW_LOAD_TIMEOUT = 600;

// Utility Helpers
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const [, base64Url] = token.split('.');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp * 1000 < Date.now();
  } catch { 
    return true; 
  }
};

// --- REUSABLE STAT CARD SUB-COMPONENT ---
const StatCard = ({ icon: Icon, themeColor, label, value, sub, onClick, isInteractive }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/20',
  };

  const chosenColors = colorMap[themeColor] || colorMap.amber;

  return (
    <div 
      onClick={isInteractive ? onClick : undefined}
      className={`p-4 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-200 ${
        isInteractive 
          ? 'cursor-pointer hover:border-amber-700 dark:hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5' 
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-stone-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider truncate">{label}</span>
        <div className={`p-2 rounded-xl border shrink-0 ${chosenColors}`}>
          <Icon size={14} />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-neutral-100 tracking-tight truncate">{value}</h3>
        <p className="text-[10px] text-stone-400 dark:text-neutral-500 mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
};

// --- PROFILE CARD VIEW FALLBACK ---
const ProfileCard = ({ user, onViewChange }) => (
  <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm max-w-md mx-auto text-center">
    <div className="w-20 h-20 bg-stone-100 dark:bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <FaUserCircle className="text-stone-400 w-12 h-12" />
      )}
    </div>
    <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-neutral-100">{user?.fullName}</h2>
    <p className="text-xs text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wider mt-1">{user?.role}</p>
    <button 
      onClick={() => onViewChange('settings')} 
      className="mt-6 w-full bg-amber-800 text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-amber-900 transition-colors"
    >
      Manage Profile Settings
    </button>
  </div>
);

// --- MAIN DASHBOARD CONTAINER ---
const Dashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Auth & Storage Targets
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  const initialUser = useMemo(() => (userString ? JSON.parse(userString) : null), [userString]);
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Structural Toggles
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= BREAKPOINT_MD);
  
  // View Routing Controllers
  const [activeView, setActiveView] = useState('overview');
  const [isViewLoading, setIsViewLoading] = useState(false);
  
  // Modal State Controllers
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [activeHistoryModal, setActiveHistoryModal] = useState(null);

  // Operational State Matrices
  const [stats, setStats] = useState({
    meetingCount: 0,
    massMeetingCount: 0,
    massesCount: 0,       
    massGiven: 0,        
    otherActivitiesCount: 0,
    totalDuesPaid: 0,
    lastEvaluatedSemester: 'Loading...',
    massesAllocatedDates: [],
    massesServedDates: [],
    meetingLogs: [] // 🛡️ CRITICAL INITIALIZATION: Prevents undefined crashes in the calendar
  });

  // Filter States for Level and Semester
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Filter logic to recount masses based on selections
  const filteredMassData = useMemo(() => {
    const filterFn = (mass) => {
      const massSem = mass.semester || 'Unknown';
      const massLev = mass.level || 'Unknown';
      
      const matchSemester = selectedSemester === 'All' || massSem === selectedSemester;
      const matchLevel = selectedLevel === 'All' || massLev === selectedLevel;
      return matchSemester && matchLevel;
    };

    const allocatedList = stats.massesAllocatedDates?.filter(filterFn) || [];
    const servedList = stats.massesServedDates?.filter(filterFn) || [];

    return {
      allocatedCount: allocatedList.length,
      servedCount: servedList.length,
      allocatedList,
      servedList,
    };
  }, [stats.massesAllocatedDates, stats.massesServedDates, selectedSemester, selectedLevel]);

  // --- MEMOIZED CONFIGURATION MATRICES ---
  const dropdownItems = useMemo(() => [
    { id: 'activityRatings', name: 'Meetings', icon: FaAward, color: 'text-amber-500' },
    { id: 'dues', name: 'Dues ', icon: FaMoneyBillWave, color: 'text-emerald-500' },
    { id: 'correspondence', name: 'Correspondence', icon: FaEnvelope, color: 'text-blue-500' },
    { id: 'feedback', name: 'Feedback ', icon: FaCommentDots, color: 'text-purple-500' },
    { id: 'community', name: 'WhatsApp Group', icon: FaWhatsapp, color: 'text-green-400' },
    { id: 'settings', name: 'Lock Profile', icon: FaLock, color: 'text-slate-400' },
    { id: 'delete', name: 'Purge Account', icon: FaTrash, color: 'text-rose-500' },
  ], []);

  const resourceSubviews = useMemo(() => [
    { id: 'calendar', label: 'Calendar' },
    { id: 'missa', label: 'Missa' },
    { id: 'rosary', label: 'Rosary' },
    { id: 'massSelection', label: 'Roster Selection' }
  ], []);

  // --- CALLBACK HANDLERS ---
  const handleViewChange = useCallback((view) => {
    if (activeView === view) return;
    setIsViewLoading(true);
    setActiveView(view);
    
    const baseTimeout = setTimeout(() => setIsViewLoading(false), VIEW_LOAD_TIMEOUT);
    return () => clearTimeout(baseTimeout);
  }, [activeView]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    window.location.href = '/login';
  }, []);

  const handleAccountPurge = useCallback(async () => {
    if (!window.confirm("Permanent deletion cannot be undone. Proceed?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/student/delete-account/${currentUser?._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      handleLogout();
    } catch (err) {
      alert(err.response?.data?.message || 'Purge operation terminated.');
    }
  }, [currentUser?._id, token, handleLogout]);

  const handleLockProfileConfirm = useCallback(async () => {
    setLockLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/student/lock-profile/${currentUser?._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsLockModalOpen(false);
      handleViewChange('settings');
    } catch (err) {
      alert(err.response?.data?.message || 'Lock execution failed.');
    } finally { 
      setLockLoading(false); 
    }
  }, [currentUser?._id, token, handleViewChange]);

  const handleMarkAsServed = useCallback(async (assignmentId) => {
    if (!window.confirm("Confirm this user has served the mass? This will update their service record.")) return;
    
    try {
      await axios.post(`${API_BASE_URL}/api/admin/mark-mass-served`, 
        { assignmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStats(prev => {
        const completedMass = prev.massesAllocatedDates.find(item => item.assignmentId === assignmentId);
        return {
          ...prev,
          massesAllocatedDates: prev.massesAllocatedDates.filter(item => item.assignmentId !== assignmentId),
          massesServedDates: completedMass ? [...prev.massesServedDates, completedMass] : prev.massesServedDates,
          massesCount: prev.massesCount + 1,
          massGiven: Math.max(0, prev.massGiven - 1)
        };
      });
      setActiveHistoryModal(null);
      alert("Mass successfully marked as served.");
      
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status.');
    }
  }, [token]);

  // --- LIFE CYCLE EFFECTS ---
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= BREAKPOINT_MD);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userId = currentUser?._id;
    if (!userId || !token) return;

    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        const endpoint = currentUser.role === 'admin' 
          ? `${API_BASE_URL}/api/admin/dashboard-stats` 
          : `${API_BASE_URL}/api/student/activity-stats/${userId}`;

        const { data } = await axios.get(endpoint, { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            semester: selectedSemester === 'All' ? undefined : selectedSemester,
            level: selectedLevel === 'All' ? undefined : selectedLevel
          }
        });

        if (!isMounted) return;

        setStats({
          meetingCount: data.meetingCount || 0,
          massMeetingCount: data.massMeetingCount || 0, 
          massesCount: data.massesCount || 0, 
          massGiven: data.massGivenCount !== undefined ? data.massGivenCount : (data.massesAllocatedDates?.length || 0), 
          otherActivitiesCount: data.otherActivitiesCount || 0,
          totalDuesPaid: data.totalDuesPaid || 0,
          lastEvaluatedSemester: 'Harmattan Semester',
          massesAllocatedDates: data.massesAllocatedDates || [],
          massesServedDates: data.massesServedDates || [],
          meetingLogs: data.meetingLogs || [] // 🛡️ CRITICAL DATA BRIDGE CONNECTED
        });

      } catch (error) {
        console.error("Dashboard Synchronization Fault:", error);
      }
    };

    fetchDashboardStats();
    return () => { isMounted = false; };
  }, [currentUser?._id, currentUser?.role, activeView, token, selectedSemester, selectedLevel]);

  // --- SECURITY AUTH GATES ---
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (currentUser && !currentUser.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-neutral-950 overflow-hidden w-full font-sans text-stone-900 dark:text-neutral-50 transition-colors duration-300">
      
      {/* Topbar Navigation Header */}
      <nav className="h-16 bg-white/90 dark:bg-neutral-900/60 backdrop-blur-md border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(prev => !prev)} 
            className="text-amber-800 dark:text-amber-200 md:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-neutral-800"
            aria-label="Toggle Navigation Control"
          >
            {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <div className="flex items-center h-8">
            <img src={altarLogo} alt="Altar Guild Identity Logo" className="h-full w-auto object-contain" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
            aria-label="Toggle Theme Engine"
          >
            {isDarkMode ? <FaSun className="text-amber-400" /> : <FaMoon className="text-amber-900" />}
          </button>
                
          <div className="flex items-center gap-4 border-l border-stone-200 dark:border-neutral-800 pl-4">
            <div className="text-right hidden sm:block leading-tight">
              <span className="block text-amber-800 dark:text-amber-500 text-[9px] font-black uppercase tracking-widest">
                {currentUser?.role === 'admin' ? 'Administrative Node' : 'Sanctuary Member'}
              </span>
              <span className="block text-stone-900 dark:text-neutral-100 text-xs font-serif font-bold">{currentUser?.fullName}</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(prev => !prev)} 
                className="flex items-center gap-2 p-1 pr-2 rounded-xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-amber-800 dark:hover:border-amber-600 transition-all"
              >
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-stone-100 dark:bg-neutral-800 flex items-center justify-center">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-stone-400 dark:text-neutral-600 w-full h-full p-0.5" />
                  )}
                </div>
                <FaChevronDown className={`text-stone-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} size={10} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                  {dropdownItems.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (item.id === 'delete') {
                          handleAccountPurge();
                        } else if (item.id === 'settings' && currentUser?.accountStatus === 'Active') {
                          setIsLockModalOpen(true);
                        } else { 
                          handleViewChange(item.id); 
                        }
                      }} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-stone-50 dark:hover:bg-neutral-800 transition-colors group"
                    >
                      <item.icon className={`${item.color} group-hover:scale-110 transition-transform`} size={14} />
                      <span className="text-stone-700 dark:text-neutral-300 text-[11px] font-bold uppercase tracking-wider">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Frame Core Layout Context Container */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Navigation Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} absolute md:relative z-40 h-full bg-white dark:bg-neutral-900/40 flex flex-col border-r border-stone-200 dark:border-neutral-800 transition-all duration-300 overflow-hidden`}>
          <div className="p-6 w-64 flex-1 overflow-y-auto space-y-8">
            <div>
              <p className="text-amber-800 dark:text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Operations</p>
              <div className="space-y-1">
                <button 
                  onClick={() => handleViewChange('overview')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeView === 'overview' ? 'bg-amber-800 text-white shadow-md shadow-amber-900/10' : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-800'}`}
                >
                  <FaTachometerAlt size={14} /> Dashboard
                </button>
                <button 
                  onClick={() => handleViewChange('profileView')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeView === 'profileView' ? 'bg-amber-800 text-white shadow-md shadow-amber-900/10' : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-800'}`}
                >
                  <FaUser size={14} /> My Profile
                </button>
                
                <button 
                  onClick={() => handleViewChange('personalLedger')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeView === 'personalLedger' ? 'bg-amber-800 text-white shadow-md shadow-amber-900/10' : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-800'}`}
                >
                  <FaAward size={14} /> My Ledger
                </button>
                
                <div className="pt-1">
                  <button 
                    onClick={() => setIsResourcesOpen(prev => !prev)} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${isResourcesOpen ? 'text-amber-800 dark:text-amber-500' : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-800'}`}
                  >
                    <div className="flex items-center gap-3"><FaBook size={14} /> Resources</div>
                    <FaChevronDown className={`transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} size={10} />
                  </button>
                  {isResourcesOpen && (
                    <div className="mt-1 ml-4 pl-3 border-l border-stone-200 dark:border-neutral-800 space-y-0.5">
                      {resourceSubviews.map((res) => (
                        <button 
                          key={res.id} 
                          onClick={() => handleViewChange(res.id)} 
                          className={`w-full text-left px-4 py-2 text-[10px] rounded-lg uppercase font-bold tracking-wider transition-colors ${activeView === res.id ? 'text-amber-800 dark:text-amber-500 bg-stone-50 dark:bg-neutral-800' : 'text-stone-500 hover:text-amber-800 dark:hover:text-neutral-300'}`}
                        >
                          {res.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-amber-800 dark:text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Finance</p>
              <div className="space-y-1">
                <button 
                  onClick={() => handleViewChange('dues')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeView === 'dues' ? 'bg-amber-800 text-white shadow-md' : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-800 group'}`}
                >
                  <FaMoneyBillWave className="group-hover:text-emerald-500 transition-colors" size={14} /> Pay Dues
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <FaSignOutAlt size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Core Dynamic Content Display Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-stone-50/50 dark:bg-neutral-950/50">
          <div className="max-w-5xl mx-auto">
            {isViewLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <PulseLoader color="#8b4513" size={10} margin={3} speedMultiplier={0.8} />
                <p className="text-amber-800 dark:text-amber-600 text-[10px] mt-4 font-bold uppercase tracking-[0.3em] animate-pulse">Synchronizing Records...</p>
              </div>
            ) : (
              <>
                {activeView === 'overview' && (
                  <div className="space-y-8 animate-fadeIn">
                    <header className="pb-4 border-b border-stone-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-serif text-amber-900 dark:text-amber-100 font-bold">Executive Dashboard</h1>
                        <p className="text-stone-500 dark:text-neutral-400 text-[11px] mt-1.5 uppercase font-bold tracking-widest">System Metrics Evaluation Matrix</p>
                      </div>
                      
                      {/* Dynamic Filter Controls */}
                      <div className="flex items-center gap-3">
                        <select 
                          value={selectedSemester} 
                          onChange={(e) => setSelectedSemester(e.target.value)}
                          className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-stone-700 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-2 outline-none focus:border-amber-800 cursor-pointer"
                        >
                          <option value="All">All Semesters</option>
                          <option value="Harmattan Semester">Harmattan Semester</option>
                          <option value="Rain Semester">Rain Semester</option>
                        </select>

                        <select 
                          value={selectedLevel} 
                          onChange={(e) => setSelectedLevel(e.target.value)}
                          className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-stone-700 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-2 outline-none focus:border-amber-800 cursor-pointer"
                        >
                          <option value="All">All Levels</option>
                          <option value="100L">100L</option>
                          <option value="200L">200L</option>
                          <option value="300L">300L</option>
                          <option value="400L">400L</option>
                          <option value="500L">500L</option>
                        </select>
                      </div>
                    </header>

                    {/* Optimized Responsive Stat Cards Layout (Supports 6 Items Perfectly) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      <StatCard icon={FaUserCircle} themeColor="blue" label="Meeting Presence" value={stats.meetingCount} sub="" />
                      
                      {/* NEWLY INTEGRATED MASS MEETING SLOT */}
                      {/* <StatCard icon={FaUsers} themeColor="purple" label="Mass Meeting" value={stats.massMeetingCount} sub="Conferences" /> */}

                      <StatCard 
                        icon={FaCalendarCheck} 
                        themeColor="amber" 
                        label="Mass Given" 
                        value={filteredMassData.allocatedCount} 
                        onClick={() => currentUser?.role === 'admin' ? setActiveHistoryModal('allocated') : handleViewChange('personalLedger')}
                        isInteractive
                      />
                      
                      <StatCard 
                        icon={FaChurch} 
                        themeColor="emerald" 
                        label="Masses Served" 
                        value={filteredMassData.servedCount} 
                
                        onClick={() => currentUser?.role === 'admin' ? setActiveHistoryModal('served') : handleViewChange('personalLedger')}
                        isInteractive
                      />
                      
                      <StatCard icon={FaTasks} themeColor="purple" label="Community Tasks" value={stats.otherActivitiesCount} sub="Verified Tasks" />
                      <StatCard icon={FaMoneyBillWave} themeColor="amber" label="Dues Portfolio" value={`₦${stats.totalDuesPaid?.toLocaleString()}`} sub="Cleared Balance" />
                    </div>

                    {/* Chart Container - Isolated safely inside the dashboard overview */}
                    <div className="mt-8 bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm p-4">
                      <GuildAnalyticsDashboard metrics={stats} />
                    </div>
                  </div>
                )}

                {/* Main Component View Switcher Router */}
                {/* {activeView === 'activityRatings' && (
                  <ActivityRatings metrics={stats} currentUser={currentUser} onBackToDashboard={() => handleViewChange('overview')} />
                )} */}
     {/* Main Component View Switcher Router */}
              {activeView === 'activityRatings' && (
                <ActivityRatings 
                  allMeetings={stats.meetingLogs} // <-- Successfully linked to your state matrix
                  metrics={stats} // Optional: Pass metrics in case the component still needs them
                  currentUser={currentUser} 
                  onBackToDashboard={() => handleViewChange('overview')} // <-- Fixed route to match your dashboard ID
                />
)}
                {activeView === 'personalLedger' && (
                  <StudentPersonalLedger studentName={currentUser?.fullName} />
                )}

                {activeView === 'settings' && <Settings user={currentUser} setCurrentUser={setCurrentUser} />}
                {activeView === 'correspondence' && <Correspondence user={currentUser} />}
                {activeView === 'community' && <Community user={currentUser} setCurrentUser={setCurrentUser} />}
                {activeView === 'feedback' && <Feedback user={currentUser} />}
                {activeView === 'dues' && <PaymentPortal currentUser={currentUser} />}
                {activeView === 'missa' && <Missa />}
                {activeView === 'rosary' && <Rosary />}
                {activeView === 'massSelection' && <MassSelection />}
                {activeView === 'calendar' && <LiturgicalCalendar />}
                {activeView === 'profileView' && <ProfileCard user={currentUser} onViewChange={handleViewChange} />}
              </>
            )}
          </div>

          {/* Detailed Liturgical Timeline Modal overlay */}
          {activeHistoryModal && currentUser?.role === 'admin' && (
            <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
                
                <div className={`p-5 text-white flex justify-between items-center ${activeHistoryModal === 'allocated' ? 'bg-amber-800' : 'bg-emerald-700'}`}>
                  <div>
                    <h3 className="font-serif font-bold text-lg">
                      {activeHistoryModal === 'allocated' ? 'Mass Assignment Roster' : 'Verified Liturgical Service'}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-90 mt-0.5">
                      Total System Entries: {activeHistoryModal === 'allocated' ? filteredMassData.allocatedCount : filteredMassData.servedCount}
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveHistoryModal(null)} 
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-transform active:scale-95"
                    aria-label="Dismiss Modal Overlay"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>

                <div className="p-5 max-h-[24rem] overflow-y-auto space-y-2.5 bg-stone-50 dark:bg-neutral-950">
                  {activeHistoryModal === 'allocated' && (
                    filteredMassData.allocatedList?.length > 0 ? (
                      filteredMassData.allocatedList.map((item, index) => (
                        <div key={item.assignmentId || index} className="flex justify-between items-center bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-4 rounded-xl transition-all hover:translate-x-1">
                          <div className="pr-4 space-y-0.5">
                            <p className="font-serif font-bold text-xs text-stone-900 dark:text-neutral-100">{item.title}</p>
                            <p className="text-[10px] text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wide">Role: {item.role || 'Scheduled Server'}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleMarkAsServed(item.assignmentId)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                            >
                              Confirm
                            </button>
                            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-1 rounded-lg whitespace-nowrap border border-amber-200 dark:border-transparent">
                              {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[10px] text-stone-400 dark:text-neutral-600 font-bold uppercase py-8 tracking-widest">No allocations recorded for this session.</p>
                    )
                  )}

                  {activeHistoryModal === 'served' && (
                    filteredMassData.servedList?.length > 0 ? (
                      filteredMassData.servedList.map((item, index) => (
                        <div key={item.assignmentId || index} className="flex justify-between items-center bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-4 rounded-xl transition-all hover:translate-x-1">
                          <div className="pr-4 space-y-0.5">
                            <p className="font-serif font-bold text-xs text-stone-900 dark:text-neutral-100">{item.title}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Status: Confirmed Served ({item.role || 'Altar Server'})</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-lg whitespace-nowrap border border-emerald-200 dark:border-transparent">
                            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[10px] text-stone-400 dark:text-neutral-600 font-bold uppercase py-8 tracking-widest">No verified service records logged by administrators.</p>
                    )
                  )}
                </div>

                <div className="p-4 bg-white dark:bg-neutral-900 border-t border-stone-100 dark:border-neutral-800 text-right">
                  <button 
                    onClick={() => setActiveHistoryModal(null)}
                    className="bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Dismiss View
                  </button>
                </div>

              </div>
            </div>
          )}

          <MembershipLockModal 
            isOpen={isLockModalOpen} 
            onClose={() => setIsLockModalOpen(false)} 
            onConfirm={handleLockProfileConfirm}
            loading={lockLoading}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;