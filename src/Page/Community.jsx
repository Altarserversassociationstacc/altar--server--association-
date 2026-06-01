import React from 'react';
import axios from 'axios';
import { FaWhatsapp } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const Community = ({ user, setCurrentUser }) => {
  const handleRequestToJoin = async () => {
    // 1. Immediately open the WhatsApp Community link in a new tab
    window.open("https://chat.whatsapp.com/FHz4mKeUSxS6SDIFmNsCqr", "_blank");

    // 2. Secretly log their request in the background so it shows "Pending" on the Admin Dashboard
    if (user?.communityRequest !== 'pending' && user?.communityRequest !== 'approved') {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/student/community-request/${user._id}`);
        const updatedUser = response.data.user;
        if (setCurrentUser) setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error logging community request", error);
      }
    }
  };

  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center py-12 md:py-24">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-green-600 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        
        <div className="text-5xl mb-4 text-green-500 animate-pulse flex justify-center">
          <FaWhatsapp />
        </div>
        
        <h3 className="text-2xl font-serif text-[#d2b48c] mb-2 tracking-tight">ASA WhatsApp Community</h3>
        <p className="text-gray-400 text-xs mt-2 mb-8 font-light uppercase tracking-widest leading-relaxed">
          By joining the community, you will be able to see all specialized sub-groups. <br /><br />
          <strong className="text-[#8b4513]">Note:</strong> Access to certain groups requires approval from the Secretary General.
        </p>

        <button
          onClick={handleRequestToJoin}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all flex justify-center items-center gap-2 border bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white border-green-900/50"
        >
          Open WhatsApp Community
        </button>

        {user?.communityRequest === 'pending' && (
          <p className="text-[10px] text-yellow-600 mt-4 italic">
            Your request has been logged. The Secretary General will review any sub-group requests you make on WhatsApp.
          </p>
        )}
        
        {user?.communityRequest === 'approved' && (
          <p className="text-[10px] text-green-500 mt-4 italic">
            You are a verified member of the WhatsApp Community.
          </p>
        )}
      </div>
    </div>
  );
};

export default Community;