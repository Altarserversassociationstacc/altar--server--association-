import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaInbox, FaCalendarAlt, FaUserShield, FaEnvelopeOpenText } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const DashboardNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        // This endpoint should be protected on your backend to return 
        // only notifications belonging to the logged-in user (based on token)
        const res = await axios.get('http://localhost:5001/api/users/notifications');
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to retrieve dashboard notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNotifications();
  }, []);

  if (loading) return (
    <div className="py-12 flex justify-center">
      <PulseLoader color="#8b4513" size={8} />
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-[#e6d5c3] dark:border-[#2a1b12] pb-4 transition-colors duration-500">
        <div>
          <h3 className="text-xl font-serif text-[#8b4513] dark:text-[#d2b48c] tracking-tight flex items-center gap-3">
            <FaInbox className="text-[#8b4513]" size={18} /> Official Correspondence
          </h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Directives from the Sacristy</p>
        </div>
        <span className="bg-[#8b4513]/20 text-[#8b4513] dark:text-[#d2b48c] px-3 py-1 rounded-full text-[9px] font-bold uppercase">
          {notifications.length} Messages
        </span>
      </header>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((msg) => (
            <div key={msg._id} className="bg-white/60 dark:bg-[#111111]/40 border border-[#e6d5c3] dark:border-[#2a1b12] p-5 rounded-2xl hover:border-[#8b4513]/30 transition-all group shadow-sm dark:shadow-none">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Vertical Status Line */}
                <div className="hidden md:block w-1 self-stretch bg-[#8b4513]/20 rounded-full group-hover:bg-[#8b4513]/50 transition-colors"></div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#8b4513] text-[9px] font-bold uppercase tracking-widest">
                      <FaUserShield size={10} /> {msg.senderRole || "Admin Office"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-[9px] font-bold uppercase tracking-widest">
                      <FaCalendarAlt size={10} /> {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h4 className="text-gray-900 dark:text-white font-serif text-base group-hover:text-[#8b4513] dark:group-hover:text-[#d2b48c] transition-colors">
                    {msg.subject}
                  </h4>
                  
                  <p className="text-gray-700 dark:text-gray-400 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 bg-white dark:bg-[#0c0c0c] border border-dashed border-[#e6d5c3] dark:border-[#2a1b12] rounded-2xl flex flex-col items-center text-center px-6 transition-colors duration-500">
          <FaEnvelopeOpenText size={24} className="text-gray-700 mb-3" />
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em] font-bold">Your sanctuary registry is currently empty.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardNotifications;