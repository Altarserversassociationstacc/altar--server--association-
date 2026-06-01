import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaStar, FaMoneyBillWave, FaEnvelope, FaCommentDots, FaWhatsapp, 
  FaCheckSquare, FaUserShield, FaTrash, FaSignOutAlt, FaUserCircle, 
  FaBars, FaTimes, FaChevronDown, FaCalendarCheck, FaTachometerAlt, 
  FaUser, FaBook, FaTasks, FaInfoCircle, FaLock, FaChartBar 
} from 'react-icons/fa';
import altarLogo from '../assets/logo.png';
import { PulseLoader } from 'react-spinners';

// Component Layer Imports
import Correspondence from './Correspondence';
import Settings from './Settings';
import Community from './Community';
import Feedback from './Feedback';
// NotificationBell import removed
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
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const initialUser = userString ? JSON.parse(userString) : null;
  
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [activeSubDrawer, setActiveSubDrawer] = useState(null);

  const [stats, setStats] = useState({
    meetingCount: 0, meetingTotal: 10, meetingPercent: 0,
    otherActivitiesCount: 0, massesCount: 0, weeksElapsed: 12,
    overallPercent: 0, standing: 'Pending...', totalDuesPaid: 0,
    totalMembers: 0, totalAssociationRevenue: 0,
    meetingLogs: [], practiceLogs: []
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

      axios.get(endpoint)
        .then(response => {
          setStats(response.data);
          if (response.data.user) {
            setCurrentUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        })
        .catch(error => console.error("Stats Error:", error));
    }
  }, [currentUser?._id, activeView]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleLockProfileConfirm = async () => {
    setLockLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/student/lock-profile/${currentUser._id}`);
      setCurrentUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsLockModalOpen(false);
      handleViewChange('settings');
    } catch (err) {
      alert(err.response?.data?.message || 'Lock failed.');
    } finally { setLockLoading(false); }
  };

  const dropdownItems = [
    { id: 'activityRatings', name: 'Activity ratings', icon: FaStar, color: 'text-yellow-500' },
    { id: 'dues', name: 'Dues', icon: FaMoneyBillWave, color: 'text-green-500' },
    { id: 'correspondence', name: 'Send Correspondence', icon: FaEnvelope, color: 'text-blue-500' },
    { id: 'feedback', name: 'Suggestions and complaints', icon: FaCommentDots, color: 'text-purple-500' },
    { id: 'community', name: 'Join our WhatsApp group', icon: FaWhatsapp, color: 'text-green-400' },
    { id: 'attendance', name: 'Write attendance (probability)', icon: FaCheckSquare, color: 'text-[#d2b48c]' },
    { id: 'settings', name: 'Lock Profile', icon: FaUserShield, color: 'text-gray-400' },
    { id: 'delete', name: 'Delete my Account', icon: FaTrash, color: 'text-red-500' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#041004] overflow-hidden w-full font-sans text-white select-none">
      
      {/* Top Identity Navigation Bar */}
      <nav className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#d2b48c] hover:text-white transition-colors md:hidden">
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <div className="flex items-center h-12 w-auto">
            <img src={altarLogo} alt="ASA Logo" className="h-full" />
          </div>
        </div>

        <div className="flex items-center gap-5 sm:gap-6">
          {/* NotificationBell removed from here */}
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                {currentUser?.role === 'admin' ? 'Executive Admin' : 'Student Member'}
              </p>
              <p className="text-white text-xs font-serif mt-1">{currentUser?.fullName}</p>
            </div>
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 h-12 rounded-xl border border-green-700 overflow-hidden bg-green-900/20 hover:scale-105 transition-all">
                <div className="h-12 w-12 shrink-0">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="User" className="w-full h-full object-cover" />
                  ) : <FaUserCircle className="text-green-500 w-full h-full p-1" />}
                </div>
                <FaChevronDown className={`text-green-500 mr-2 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={12} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-2">
                  {dropdownItems.map((item, index) => (
                    <button key={index} onClick={() => {
                      if (item.id === 'delete') {
                        if (window.confirm("Account data drops cannot be reversed. Proceed?")) {
                          axios.delete(`${API_BASE_URL}/api/student/delete-account/${currentUser._id}`).then(() => handleLogout());
                        }
                      } else if (item.id === 'settings' && currentUser?.accountStatus === 'Active') {
                        setIsLockModalOpen(true);
                      } else { handleViewChange(item.id); }
                      setIsDropdownOpen(false);
                    }} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1a110b] transition-colors">
                      <item.icon className={item.color} size={14} />
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Aside Content (Sidebar) */}
        <aside style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }} className="absolute md:relative z-40 h-full bg-black/20 backdrop-blur-md flex flex-col shrink-0 shadow-2xl overflow-hidden border-r border-white/10 transition-all duration-300">
          <div style={{ width: `${sidebarWidth}px` }} className="p-6 flex-1 overflow-y-auto shrink-0">
            <p className="text-[#8b4513] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Main Menu</p>
            <div className="space-y-2">
              <button onClick={() => handleViewChange('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'overview' ? 'bg-[#1a110b] border-[#3d2b1f] text-[#d2b48c] shadow-inner' : 'bg-transparent border-transparent text-gray-500 hover:bg-[#111111] hover:text-white'}`}>
                <FaTachometerAlt size={14} /> Dashboard
              </button>
              <button onClick={() => handleViewChange('profileView')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#111111] text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest ${activeView === 'profileView' ? 'bg-[#1a110b] text-[#d2b48c] shadow-inner' : ''}`}>
                <FaUser size={14} /> Profile
              </button>
              
              <div>
                <button onClick={() => setIsResourcesOpen(!isResourcesOpen)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${isResourcesOpen ? 'bg-[#1a110b] border-[#3d2b1f] text-[#d2b48c] shadow-inner' : 'bg-transparent border-transparent text-gray-500 hover:bg-[#111111] hover:text-white'}`}>
                  <div className="flex items-center gap-3"><FaBook size={14} /> Resources</div>
                  <FaChevronDown className={`transition-transform duration-300 ${isResourcesOpen ? 'rotate-180' : ''}`} size={12} />
                </button>
                {isResourcesOpen && (
                  <div className="mt-2 ml-4 pl-4 border-l border-white/5 space-y-1 animate-fadeIn">
                    <button onClick={() => handleViewChange('calendar')} className="w-full text-left px-4 py-2 text-[10px] text-gray-500 hover:text-[#d2b48c] uppercase font-bold tracking-widest">Liturgical Calendar</button>
                    <button onClick={() => handleViewChange('missa')} className="w-full text-left px-4 py-2 text-[10px] text-gray-500 hover:text-[#d2b48c] uppercase font-bold tracking-widest">Missa (EN|LAT|IG)</button>
                    <button onClick={() => handleViewChange('rosary')} className="w-full text-left px-4 py-2 text-[10px] text-gray-500 hover:text-[#d2b48c] uppercase font-bold tracking-widest">Rosary (EN|IG)</button>
                    <button onClick={() => handleViewChange('massSelection')} className="w-full text-left px-4 py-2 text-[10px] text-gray-500 hover:text-[#d2b48c] uppercase font-bold tracking-widest">Mass Selection List</button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-[#8b4513] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 mt-10">Quick Actions</p>
            <div className="space-y-2">
              <button onClick={() => handleViewChange('dues')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#111111] text-gray-500 hover:text-white transition-colors group">
                <FaMoneyBillWave className="group-hover:text-green-500" size={14} /> <span className="text-xs font-bold uppercase tracking-widest">Pay Dues</span>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/20 text-red-500 group">
                <FaSignOutAlt /> <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Workspace Container */}
        <main className="flex-1 overflow-y-auto bg-[#041004] p-6 md:p-12 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            {isViewLoading ? (
              <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
                <PulseLoader color="#3b82f6" size={14} margin={6} speedMultiplier={0.7} />
                <p className="text-blue-500 text-[10px] mt-6 font-bold uppercase tracking-[0.3em] animate-pulse">Loading View Container...</p>
              </div>
            ) : (
              <>
                {activeView === 'overview' && (
                  <div className="animate-fadeIn space-y-8">
                    <header className="mb-10 pb-6 border-b border-white/10">
                       <h1 className="text-3xl md:text-4xl font-serif text-[#d2b48c] tracking-tight">Sanctuary Dashboard</h1>
                       <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em]">Welcome, <strong className="text-white">{currentUser?.fullName}</strong></p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* STAT CARDS */}
                      <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><FaUserCircle size={20}/></div>
                          <span className="text-[10px] text-blue-500 font-black">{stats.meetingPercent || 0}% Yield</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold relative z-10">{stats.meetingCount || 0}</h3>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mt-1 relative z-10">Total Meetings</p>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><FaCalendarCheck size={20}/></div>
                          <span className="text-[10px] text-green-500 font-black">{stats.weeksElapsed || 0} Wks Active</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold relative z-10">{stats.massesCount || 0}</h3>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mt-1 relative z-10">Masses Attended</p>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><FaTasks size={20}/></div>
                          <span className="text-[10px] text-purple-500 font-black">{stats.overallPercent || 0}% Rating</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold relative z-10">{stats.otherActivitiesCount || 0}</h3>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mt-1 relative z-10">Practices & Tasks</p>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><FaMoneyBillWave size={20}/></div>
                          <span className="text-[10px] text-yellow-500 font-black">Verified Ledger</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold relative z-10">₦{stats.totalDuesPaid?.toLocaleString() || 0}</h3>
                        <p className="text-gray-500 text-[10px] uppercase font-bold mt-1 relative z-10">Total Revenue</p>
                      </div>
                    </div>

                    <div className="mt-8">
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
                    <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
                      <div className="h-24 w-24 rounded-3xl bg-green-900/20 border-2 border-green-800 mx-auto overflow-hidden mb-6 flex items-center justify-center shadow-inner">
                        {currentUser?.profilePicture ? <img src={currentUser.profilePicture} className="w-full h-full object-cover" /> : <FaUserCircle size={40} className="text-green-500" />}
                      </div>
                      <h2 className="text-2xl font-serif text-green-300">{currentUser?.fullName}</h2>
                      <p className="text-green-700 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{currentUser?.currentLevel} Member</p>
                      <button onClick={() => handleViewChange('settings')} className="w-full mt-8 border border-white/10 hover:bg-white/5 text-green-300 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Edit Profile Details</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

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