import React from 'react';
import { FaLock, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const MembershipLockModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0c0c0c] border border-red-900/30 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Aesthetic Status Bar */}
        <div className="h-2 bg-gradient-to-r from-red-900 via-red-600 to-red-900"></div>
        
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-900/10 border border-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <FaLock size={28} className="animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-serif text-white mb-2 tracking-tight">Lock Membership Profile</h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-6">Security Protocol Activation</p>
          
          <div className="bg-red-950/20 border border-red-900/20 rounded-xl p-4 text-left mb-8 space-y-3">
            <div className="flex gap-3">
              <FaExclamationTriangle className="text-red-500 shrink-0 mt-1" size={14} />
              <p className="text-gray-300 text-xs leading-relaxed">
                By locking your profile, all bio-data fields will become <strong>read-only</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <FaShieldAlt className="text-blue-500 shrink-0 mt-1" size={14} />
              <p className="text-gray-300 text-xs leading-relaxed">
                Future modifications will require formal request and <strong>Admin Approval</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-xl tracking-widest transition-all uppercase text-[10px] shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <PulseLoader color="#ffffff" size={8} /> : "Confirm Secure Lock"}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-gray-400 py-3 rounded-xl tracking-widest transition-all uppercase text-[10px]"
            >
              Cancel Operation
            </button>
          </div>
        </div>

        <div className="bg-black/40 py-3 border-t border-white/5 text-center">
           <p className="text-[8px] text-gray-600 uppercase tracking-[0.3em] font-black italic">Protected by ASA Security Framework</p>
        </div>
      </div>
    </div>
  );
};

export default MembershipLockModal;