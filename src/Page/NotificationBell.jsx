import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const NotificationBell = ({ currentUser }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => n.unread).length;

  // Fetch notifications on load
  useEffect(() => {
    if (currentUser) {
      axios.get(`${API_BASE_URL}/api/notifications/user/${currentUser._id}`)
        .then(res => {
          const formatted = res.data.map(n => ({
            id: n._id,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleDateString(),
            unread: !n.isRead
          }));
          // Add a default welcome notification if their inbox is completely empty
          setNotifications(formatted.length > 0 ? formatted : [{ id: 'welcome', title: 'Welcome to ASA Portal', message: 'Your sanctuary access has been granted.', time: 'Just now', unread: true }]);
        })
        .catch(err => console.error("Error fetching notifications:", err));
    }
  }, [currentUser]);

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/user/${currentUser._id}/read-all`);
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    } finally {
      // Optimistically update the UI to clear the red badge regardless
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        onBlur={() => setTimeout(() => setIsNotificationOpen(false), 300)}
        className="relative p-2 text-[#d2b48c] hover:text-white transition-colors focus:outline-none group"
      >
        <FaBell size={18} className="group-hover:scale-110 transition-transform duration-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white shadow-lg animate-pulse border border-black">
            {unreadCount}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div className="absolute -right-20 sm:right-0 mt-3 w-[90vw] max-w-[320px] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
            <h3 className="text-[#d2b48c] font-serif text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-[9px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest transition-colors">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 border-b border-white/5 last:border-b-0 transition-colors ${notif.unread ? 'bg-white/5' : 'hover:bg-white/10'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-xs font-bold ${notif.unread ? 'text-white' : 'text-gray-400'}`}>{notif.title}</h4>
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest ml-2 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FaBell className="text-[#3d2b1f] text-3xl mx-auto mb-3 opacity-50" />
                <p className="text-gray-500 text-xs font-light uppercase tracking-widest">All caught up</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;