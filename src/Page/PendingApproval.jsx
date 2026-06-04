import React, { useState, useEffect } from 'react';
import { FaHourglassHalf, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Pull the API URL from environment configuration files dynamically
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const PendingApproval = () => {
  const navigate = useNavigate();
  const [isApproved, setIsApproved] = useState(false);
  const email = localStorage.getItem('pendingEmail') || localStorage.getItem('email');

  // SYSTEM 1: Polling Database Synchronization Loop
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const checkStatus = async () => {
      if (!email) return;
      
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/student/check-status/${encodeURIComponent(email)}`,
          { signal: abortController.signal }
        );
        
        if (isMounted && res.data?.isAdminApproved === true) {
          setIsApproved(true);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Status synchronization sync dropped temporarily.");
        }
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus(); // Immediate execution on mount
    
    return () => {
      isMounted = false;
      clearInterval(interval);
      abortController.abort(); // Cancel pending network frames if component unmounts
    };
  }, [email]);

  // SYSTEM 2: Transactional Route Forwarding Delay Bridge
  useEffect(() => {
    if (isApproved) {
      const timer = setTimeout(() => {
        navigate('/verify-email');
      }, 3000); 
      
      return () => clearTimeout(timer); 
    }
  }, [isApproved, navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8f5f2] dark:bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans select-none transition-colors duration-500">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[#8b4513] rounded-full blur-[180px] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      {/* Main Interface Frame */}
      <div className="max-w-md w-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-[#e6d5c3] dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden text-center relative z-10 animate-fadeIn transition-colors"> 
        <div className="p-10">
          
          {!isApproved ? (
            <div className="animate-fadeIn">
              <div className="w-24 h-24 bg-[#8b4513]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#8b4513]/30 shadow-[0_0_40px_rgba(139,69,19,0.15)]">
                <FaHourglassHalf size={40} className="text-[#8b4513] dark:text-[#d2b48c] animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">Registration Received</h2>
              <div className="h-1 w-12 bg-[#8b4513] mx-auto mt-4 rounded-full"></div> 

              <div className="space-y-4 mt-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-light leading-relaxed">
                  Peace be with you. Your application to join the Altar Server Association has been successfully submitted.
                </p>
                <p className="text-[#8b4513] dark:text-[#d2b48c]/80 text-xs font-semibold uppercase tracking-[0.25em]">
                  Awaiting Administrative Review
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-bounceIn">
              <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                <FaCheckCircle size={45} className="text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">Approval Granted!</h2>
              <div className="h-1 w-12 bg-green-600 mx-auto mt-4 rounded-full"></div> 

              <div className="space-y-4 mt-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-light leading-relaxed">
                  Great news! Your account has been verified by the administration. Forwarding you to email verification panel...
                </p>
              </div>

              <div className="mt-10">
                <button
                  type="button"
                  onClick={() => navigate('/verify-email')}
                  className="w-full bg-gradient-to-r from-[#8b4513] to-[#5c4033] hover:from-[#a0522d] hover:to-[#8b4513] text-white font-bold py-4 px-4 rounded-xl tracking-[0.2em] transition-all duration-300 uppercase text-[10px] shadow-lg flex items-center justify-center gap-2"
                >
                  <FaShieldAlt size={12} /> Enter Verification Code
                </button>
              </div>
            </div>
          )}
          
        </div>
        
        <div className="bg-[#8b4513]/5 py-4 border-t border-[#e6d5c3] dark:border-white/5">
           <p className="text-[9px] text-[#8b4513] dark:text-[#d2b48c]/60 uppercase tracking-[0.3em] font-black">Sanctuary Access Management</p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;