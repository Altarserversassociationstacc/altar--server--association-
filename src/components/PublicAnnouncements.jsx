import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const PublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/announcements`);
        
        // Ensure res.data is an array before sorting
        const data = Array.isArray(res.data) ? res.data : [];

        // Sort by createdAt (newest first) or fallback to ID order
        const sorted = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        // Limit to 3 items for the landing page grid
        setAnnouncements(sorted.slice(0, 6)); // Increased to 6 to ensure visibility during testing
      } catch (err) {
        console.error("Error fetching announcements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#f8f5f2] dark:bg-[#050505] transition-colors duration-500">
        <PulseLoader color="#8b4513" size={10} />
        <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-4">Retrieving the Clarion Call...</p>
      </div>
    );
  }

  return (
    <section id="announcements" className="py-24 px-6 bg-[#f8f5f2] dark:bg-[#050505] border-t border-[#e6d5c3] dark:border-[#2a1b12] scroll-mt-20 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 text-center">
          <div className="w-12 h-12 bg-[#8b4513]/10 border border-[#8b4513]/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBell className="text-[#8b4513] text-xl" />
          </div>
          <h2 className="text-4xl font-serif text-[#8b4513] dark:text-[#d2b48c] mb-3">Announcements</h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">Latest Broadcasts from the Association</p>
        </header>

        {announcements.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {announcements.map((item) => {
              const isExpanded = expandedId === item._id;

              return (
              <div 
                key={item._id} 
                className={`bg-white dark:bg-[#0c0c0c] border border-[#e6d5c3] dark:border-[#2a1b12] rounded-2xl transition-all duration-500 group shadow-lg relative overflow-hidden ${isExpanded ? 'border-[#8b4513]/50' : 'hover:border-[#8b4513]/30'}`}
              >
                {/* Ghost Background Icon */}
                <div className={`absolute top-1/2 -translate-y-1/2 -right-10 opacity-[0.02] text-[#8b4513] pointer-events-none transition-all duration-500 ${isExpanded ? 'scale-150 opacity-[0.04]' : 'group-hover:opacity-[0.04]'}`}>
                  <FaBell size={140} />
                </div>

                <div 
                  className="relative z-10 p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => toggleExpand(item._id)}
                >
                  <div className="flex-1 space-y-3">
                     <div className="flex items-center gap-3">
                        <span className="inline-block text-[#8b4513] text-[8px] font-bold uppercase tracking-[0.3em] px-2 py-1 bg-[#8b4513]/10 rounded border border-[#8b4513]/20">
                          {item.category || "Official Broadcast"}
                        </span>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-500 text-[9px] font-bold uppercase tracking-widest">
                          <FaCalendarAlt className="text-[#8b4513]" size={10} />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                        </div>
                     </div>
                     <h3 className="text-xl md:text-2xl font-serif text-gray-900 dark:text-white group-hover:text-[#8b4513] dark:group-hover:text-[#d2b48c] transition-colors leading-tight pr-4">
                       {item.title}
                     </h3>
                  </div>
                  
                  <div className="flex items-center justify-end shrink-0">
                    <div className={`w-10 h-10 rounded-full border border-[#e6d5c3] dark:border-[#2a1b12] flex items-center justify-center text-[#8b4513] transition-all duration-300 ${isExpanded ? 'bg-[#8b4513]/10 rotate-180' : 'bg-transparent group-hover:bg-gray-50 dark:group-hover:bg-[#1a110b]'}`}>
                      <FaChevronDown size={14} />
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`relative z-10 transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="p-6 md:p-8 pt-0 border-t border-[#e6d5c3] dark:border-[#2a1b12]/30 mt-2">
                      <div className="bg-gray-50 dark:bg-[#111111]/80 backdrop-blur-sm p-6 rounded-xl border border-[#e6d5c3] dark:border-[#2a1b12]/50 shadow-inner">
                        <p className="text-gray-800 dark:text-gray-300 text-sm md:text-base leading-[1.8] font-medium whitespace-pre-wrap font-sans selection:bg-[#8b4513]/40 tracking-wide">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-[#e6d5c3] dark:border-[#2a1b12] rounded-3xl transition-colors duration-500">
            <p className="text-gray-600 text-xs uppercase tracking-widest">No active announcements at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicAnnouncements;
