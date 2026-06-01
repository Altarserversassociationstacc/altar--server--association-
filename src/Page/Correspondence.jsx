import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPaperPlane, FaUserTie } from 'react-icons/fa';
import { PulseLoader, SyncLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const Correspondence = ({ user }) => {
  const [form, setForm] = useState({
    recipient: 'Secretary General',
    subject: 'Excuse from Meeting',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Wavy loading before the page content loads
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/student/correspondence/${user._id}`, form);
      setStatus({ loading: false, error: '', success: res.data.message });
      setForm({ ...form, message: '' }); // Clear message on success
      setTimeout(() => setStatus(s => ({ ...s, success: '' })), 4000);
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to send message.', success: '' });
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
        <SyncLoader color="#3b82f6" size={14} margin={6} speedMultiplier={0.8} />
        <p className="text-blue-500 text-[10px] mt-6 font-bold uppercase tracking-[0.3em] animate-pulse">Loading Interface...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-serif text-[#d2b48c] mb-6">Official Correspondence</h2>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl">
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-6">
          <div className="w-12 h-12 rounded-full bg-blue-900/20 border border-blue-900/50 flex items-center justify-center shrink-0">
            <FaEnvelope className="text-blue-500" size={20} />
          </div>
          <div>
            <h3 className="text-white font-serif text-xl">Send a Message</h3>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Submit excuses or general inquiries directly to the executives</p>
          </div>
        </div>

        {status.error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 text-red-500 text-xs rounded-lg text-center uppercase tracking-widest">
            {status.error}
          </div>
        )}
        {status.success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-900/50 text-green-500 text-xs rounded-lg text-center uppercase tracking-widest">
            {status.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Recipient (Executive)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <FaUserTie size={14} />
                </div>
                <select
                  value={form.recipient}
                  onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 p-3.5 text-sm text-[#d2b48c] focus:ring-2 focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Secretary General">Secretary General</option>
                  <option value="PRO">Public Relations Officer (PRO)</option>
                  <option value="President">President</option>
                  <option value="Liturgical Coordinator">Liturgical Coordinator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Subject / Reason</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3.5 text-sm text-[#d2b48c] focus:ring-2 focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="Excuse from Meeting">Excuse from Meeting</option>
                <option value="Excuse from Mass/Duty">Excuse from Mass/Duty</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Suggestion">Suggestion / Feedback</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Message Content</label>
            <textarea
              required
              rows="6"
              placeholder="Type your message here... (If excusing yourself, state the exact date and reason)."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-[#d2b48c] focus:ring-2 focus:ring-blue-900/50 focus:border-blue-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            {status.loading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : <><FaPaperPlane /> Send Correspondence</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Correspondence;