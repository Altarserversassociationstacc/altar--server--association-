import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaStar, FaMoneyBillWave, FaEnvelope, FaCommentDots, FaWhatsapp, 
  FaCheckSquare, FaUserShield, FaTrash, FaSignOutAlt, FaUserCircle, 
  FaBars, FaTimes, FaChevronDown, FaCalendarCheck, FaTachometerAlt,
  FaUser, FaBook, FaTasks, FaInfoCircle, FaLock, FaChartBar,
  FaMoon, FaSun, FaAward, FaChurch
} from 'react-icons/fa';
import altarLogo from '../assets/logo.png';
import { PulseLoader } from 'react-spinners';
import { useTheme } from '../context/ThemeContext.jsx';

// Component Layer Imports
import Correspondence from './Correspondence';
import Settings from './Settings';
import Community from './Community';
import Feedback from './Feedback';
import Missa from './Missa';
import Rosary from './Rosary';
import MassSelection from './MassSelection';
import LiturgicalCalendar from './LiturgicalCalendar';
import { ExecutiveLandingPage } from './ExecutiveLandingPage';
import MembershipLockModal from '../components/MembershipLockModal';
import ActivityRatings from '../Page/ActivityRatings';
import GuildAnalyticsDashboard from '../components/GuildAnalyticsDashboard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp * 1000 < Date.now();
  } catch (error) { return true; }
};

const Dashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const initialUser = userString ? JSON.parse(userString) : null;
  
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [activeView, setActiveView] = useState('overview');
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [activeSubDrawer, setActiveSubDrawer] = useState(null);

  // Numerical Accumulator State (No Qualitative Labels)
  const [stats, setStats] = useState({
    meetingCount: 0,
    massesCount: 0,
    otherActivitiesCount: 0,
    totalDuesPaid: 0,
    lastEvaluatedSemester: 'Harmattan 2026'
  });

  const handleViewChange = (view) => {
    if (activeView === view) return;
    setIsViewLoading(true);
    setActiveView(view);
    setTimeout(() => setIsViewLoading(false), 800);
  };

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (currentUser && !currentUser.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentUser?._id) {
      const endpoint = currentUser.role === 'admin' 
        ? `${API_BASE_URL}/api/admin/dashboard-stats` 
        : `${API_BASE_URL}/api/student/activity-stats/${currentUser._id}`;

      axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` }})
        .then(response => {
          const data = response.data;
          setStats({
            meetingCount: data.activityMetrics?.meetingCount || data.meetingCount || 0,
            massesCount: data.activityMetrics?.massesCount || data.massesCount || 0,
            otherActivitiesCount: data.activityMetrics?.otherActivitiesCount || data.otherActivitiesCount || 0,
            totalDuesPaid: data.totalDuesPaid || 0,
            lastEvaluatedSemester: data.activityMetrics?.lastEvaluatedSemester || 'Current Semester'
          });

          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        })
        .catch(error => console.error("Stats Handshake Error:", error));
    }
  }, [currentUser?._id, activeView]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // ✅ RESTORED: Profile Lock Execution Handler
  const handleLockProfileConfirm = async () => {
    setLockLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/student/lock-profile/${currentUser._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsLockModalOpen(false);
      handleViewChange('settings');
    } catch (err) {
      alert(err.response?.data?.message || 'Lock profile execution failed.');
    } finally { 
      setLockLoading(false); 
    }
  };

  const dropdownItems = [
    { id: 'activityRatings', name: 'Service Record', icon: FaAward, color: 'text-amber-500' },
    { id: 'dues', name: 'Dues & Ledger', icon: FaMoneyBillWave, color: 'text-green-500' },
    { id: 'correspondence', name: 'Correspondence', icon: FaEnvelope, color: 'text-blue-500' },
    { id: 'feedback', name: 'Feedback Hub', icon: FaCommentDots, color: 'text-purple-500' },
    { id: 'community', name: 'WhatsApp Group', icon: FaWhatsapp, color: 'text-green-400' },
    { id: 'settings', name: 'Lock Profile', icon: FaLock, color: 'text-gray-400' },
    { id: 'delete', name: 'Purge Account', icon: FaTrash, color: 'text-red-500' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#fdfbf9] dark:bg-[#050505] overflow-hidden w-full font-sans text-gray-900 dark:text-white select-none transition-colors duration-500">
      
      {/* Identity Navigation Bar */}
      <nav className="h-16 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-[#e6d5c3] dark:border-white/10 flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#8b4513] dark:text-[#d2b48c] hover:opacity-80 transition-colors md:hidden">
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <div className="flex items-center h-10 w-auto">
            <img src={altarLogo} alt="ASA Logo" className="h-full object-contain" />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 transition-all active:scale-90 cursor-pointer">
            {isDarkMode ? <FaSun className="text-amber-400" /> : <FaMoon className="text-[#8b4513]" />}
          </button>

          <div className="flex items-center gap-4 border-l border-[#e6d5c3] dark:border-white/10 pl-6">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-[#8b4513] dark:text-amber-500 text-[9px] font-black uppercase tracking-widest">
                {currentUser?.role === 'admin' ? 'Administrative Node' : 'Sanctuary Member'}
              </p>
              <p className="text-gray-900 dark:text-white text-xs font-serif font-bold">{currentUser?.fullName}</p>
            </div>
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 h-11 rounded-xl border-2 border-[#8b4513]/20 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#8b4513] transition-all cursor-pointer">
                <div className="h-10 w-10 shrink-0 p-1">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="User" className="w-full h-full object-cover rounded-lg" />
                  ) : <FaUserCircle className="text-[#8b4513] dark:text-[#d2b48c] w-full h-full" />}
                </div>
                <FaChevronDown className={`text-[#8b4513] dark:text-[#d2b48c] mr-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={10} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#0c0c0c] backdrop-blur-2xl border border-[#e6d5c3] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-2 animate-slideUp">
                  {dropdownItems.map((item, index) => (
                    <button key={index} onClick={() => {
                      if (item.id === 'delete') {
                        if (window.confirm("Account deletion is permanent. Proceed?")) {
                          axios.delete(`${API_BASE_URL}/api/student/delete-account/${currentUser._id}`).then(() => handleLogout());
                        }
                      } else if (item.id === 'settings' && currentUser?.accountStatus === 'Active') {
                        setIsLockModalOpen(true);
                      } else { handleViewChange(item.id); }
                      setIsDropdownOpen(false);
                    }} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                      <item.icon className={`${item.color} group-hover:scale-110 transition-transform`} size={14} />
                      <span className="text-gray-700 dark:text-gray-300 text-[11px] font-bold uppercase tracking-wider">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }} className="absolute md:relative z-40 h-full bg-white dark:bg-black/20 flex flex-col shrink-0 border-r border-[#e6d5c3] dark:border-white/10 transition-all duration-300 overflow-hidden">
          <div style={{ width: `${sidebarWidth}px` }} className="p-6 flex-1 overflow-y-auto">
            <p className="text-[#8b4513] text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60">Operations</p>
            <div className="space-y-1.5">
              <button onClick={() => handleViewChange('overview')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeView === 'overview' ? 'bg-[#8b4513] text-white shadow-lg shadow-[#8b4513]/20' : 'text-gray-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}>
                <FaTachometerAlt size={14} /> Dashboard
              </button>
              <button onClick={() => handleViewChange('profileView')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeView === 'profileView' ? 'bg-[#8b4513] text-white shadow-lg shadow-[#8b4513]/20' : 'text-gray-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}>
                <FaUser size={14} /> My Profile
              </button>
              
              <div className="pt-2">
                <button onClick={() => setIsResourcesOpen(!isResourcesOpen)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${isResourcesOpen ? 'text-[#8b4513] dark:text-[#d2b48c]' : 'text-gray-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3"><FaBook size={14} /> Resources</div>
                  <FaChevronDown className={`transition-transform duration-300 ${isResourcesOpen ? 'rotate-180' : ''}`} size={10} />
                </button>
                {isResourcesOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-[#e6d5c3] dark:border-white/10 space-y-1 animate-fadeIn">
                    <button onClick={() => handleViewChange('calendar')} className="w-full text-left px-4 py-2.5 text-[9px] text-gray-500 hover:text-[#8b4513] dark:hover:text-[#d2b48c] uppercase font-black tracking-widest cursor-pointer">Liturgical Calendar</button>
                    <button onClick={() => handleViewChange('missa')} className="w-full text-left px-4 py-2.5 text-[9px] text-gray-500 hover:text-[#8b4513] dark:hover:text-[#d2b48c] uppercase font-black tracking-widest cursor-pointer">The Missal (Ordo)</button>
                    <button onClick={() => handleViewChange('rosary')} className="w-full text-left px-4 py-2.5 text-[9px] text-gray-500 hover:text-[#8b4513] dark:hover:text-[#d2b48c] uppercase font-black tracking-widest cursor-pointer">Rosarium Ledger</button>
                    <button onClick={() => handleViewChange('massSelection')} className="w-full text-left px-4 py-2.5 text-[9px] text-gray-500 hover:text-[#8b4513] dark:hover:text-[#d2b48c] uppercase font-black tracking-widest cursor-pointer">Roster Selection</button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-[#8b4513] text-[10px] font-black uppercase tracking-[0.3em] mb-6 mt-12 opacity-60">Finance</p>
            <div className="space-y-1.5">
              <button onClick={() => handleViewChange('dues')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                <FaMoneyBillWave className="group-hover:text-green-500" size={14} /> Pay Dues
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer">
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Workspace Display */}
        <main className="flex-1 overflow-y-auto bg-transparent p-6 md:p-12 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            {isViewLoading ? (
              <div className="flex flex-col items-center justify-center py-40 animate-fadeIn">
                <PulseLoader color="#8b4513" size={12} margin={4} speedMultiplier={0.7} />
                <p className="text-[#8b4513] text-[9px] mt-6 font-black uppercase tracking-[0.4em] animate-pulse">Syncing Archive Database...</p>
              </div>
            ) : (
              <>
                {activeView === 'overview' && (
                  <div className="animate-fadeIn space-y-10">
                    <header className="mb-10 pb-6 border-b-2 border-[#e6d5c3] dark:border-white/5">
                       <h1 className="text-4xl md:text-5xl font-serif text-[#8b4513] dark:text-[#d2b48c] tracking-tight">Executive Dashboard</h1>
                       <p className="text-gray-500 dark:text-gray-400 text-xs mt-3 uppercase font-bold tracking-[0.2em]">Active Term: <strong className="text-gray-900 dark:text-white">{stats.lastEvaluatedSemester}</strong></p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white dark:bg-[#0c0c0c] border border-[#e6d5c3] dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><FaUserCircle size={22}/></div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/60">Practice Attendance</span>
                        </div>
                        <h3 className="text-gray-900 dark:text-white text-4xl font-serif font-black">{stats.meetingCount}</h3>
                        <p className="text-gray-400 text-[10px] uppercase font-black mt-2 tracking-widest">Total Sittings</p>
                      </div>

                      <div className="bg-white dark:bg-[#0c0c0c] border border-[#e6d5c3] dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><FaChurch size={22}/></div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Sanctuary Service</span>
                        </div>
                        <h3 className="text-gray-900 dark:text-white text-4xl font-serif font-black">{stats.massesCount}</h3>
                        <p className="text-gray-400 text-[10px] uppercase font-black mt-2 tracking-widest">Masses Served</p>
                      </div>

                      <div className="bg-white dark:bg-[#0c0c0c] border border-[#e6d5c3] dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500"><FaTasks size={22}/></div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-500/60">Community Tasks</span>
                        </div>
                        <h3 className="text-gray-900 dark:text-white text-4xl font-serif font-black">{stats.otherActivitiesCount}</h3>
                        <p className="text-gray-400 text-[10px] uppercase font-black mt-2 tracking-widest">Total Verified</p>
                      </div>

                      <div className="bg-white dark:bg-[#0c0c0c] border border-[#e6d5c3] dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><FaMoneyBillWave size={22}/></div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/60">Dues Portfolio</span>
                        </div>
                        <h3 className="text-gray-900 dark:text-white text-4xl font-serif font-black">₦{stats.totalDuesPaid?.toLocaleString()}</h3>
                        <p className="text-gray-400 text-[10px] uppercase font-black mt-2 tracking-widest">Cleared Balance</p>
                      </div>
                    </div>

                    <div className="mt-12 bg-white/50 dark:bg-black/20 rounded-3xl p-1 border border-dashed border-[#e6d5c3] dark:border-white/5">
                       <GuildAnalyticsDashboard metrics={stats} />
                    </div>
                  </div>
                )}

                {/* CONTENT ROUTER */}
                {activeView === 'analytics' && <GuildAnalyticsDashboard metrics={stats} />}
                {activeView === 'activityRatings' && (
                  <ActivityRatings 
                    metrics={stats} 
                    currentUser={currentUser} 
                    activeSubDrawer={activeSubDrawer}
                    setActiveSubDrawer={setActiveSubDrawer}
                    onBackToDashboard={() => handleViewChange('overview')} 
                  />
                )}
                {activeView === 'settings' && <Settings user={currentUser} setCurrentUser={setCurrentUser} />}
                {activeView === 'correspondence' && <Correspondence user={currentUser} />}
                {activeView === 'executives' && <ExecutiveLandingPage />}
                {activeView === 'community' && <Community user={currentUser} setCurrentUser={setCurrentUser} />}
                {activeView === 'feedback' && <Feedback user={currentUser} />}
                {activeView === 'missa' && <Missa />}
                {activeView === 'rosary' && <Rosary />}
                {activeView === 'massSelection' && <MassSelection />}
                {activeView === 'calendar' && <LiturgicalCalendar />}
                
                {activeView === 'profileView' && (
                  <div className="animate-fadeIn py-10 flex justify-center">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0c0c0c] border border-[#e6d5c3] dark:border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-[#8b4513]"></div>
                      <div className="h-28 w-28 rounded-3xl bg-[#8b4513]/10 dark:bg-[#1a110b] border-2 border-[#8b4513]/20 mx-auto overflow-hidden mb-8 flex items-center justify-center shadow-inner group">
                        {currentUser?.profilePicture ? <img src={currentUser.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <FaUserCircle size={48} className="text-[#8b4513]" />}
                      </div>
                      <h2 className="text-3xl font-serif text-gray-900 dark:text-white font-bold">{currentUser?.fullName}</h2>
                      <p className="text-[#8b4513] dark:text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 mb-8">{currentUser?.currentLevel} Member Status</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleViewChange('settings')} className="bg-[#8b4513] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#8b4513]/20 active:scale-95 transition-all cursor-pointer">Edit Bio-Data</button>
                        <button onClick={() => handleViewChange('activityRatings')} className="border border-[#e6d5c3] dark:border-white/10 text-gray-600 dark:text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer">View Credits</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fixed Modal Setup: Passes the newly defined handler string parameters */}
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