import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const Feedback = ({ user }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    
    try {
      // We can reuse the correspondence endpoint here!
      const payload = { recipient: 'Executives (Feedback)', subject: 'Suggestion / Complaint', message };
      const res = await axios.post(`${API_BASE_URL}/api/student/correspondence/${user._id}`, payload);
      
      setStatus({ loading: false, error: '', success: 'Your feedback has been submitted successfully!' });
      setMessage('');
      setTimeout(() => setStatus(s => ({ ...s, success: '' })), 4000);
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to send feedback.', success: '' });
    }
  };

  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center py-12 md:py-24 transition-colors duration-500">
      <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#e6d5c3] dark:border-[#2a1b12] p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-lg w-full transition-colors">
        <div className="w-20 h-20 bg-[#8b4513]/10 dark:bg-blue-900/20 border border-[#8b4513]/30 dark:border-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaEnvelope className="text-[#8b4513] dark:text-blue-500 text-3xl" />
        </div>
        <h2 className="text-3xl font-serif text-[#8b4513] dark:text-[#d2b48c] mb-2 tracking-tight">Suggestions & Complaints</h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs mb-10 font-light uppercase tracking-widest leading-relaxed">
          Your voice matters. Send an automatic email to the association's executives with your suggestions or complaints.
        </p>

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

        <form onSubmit={handleSendFeedback} className="text-left w-full space-y-6">
          <div>
             <textarea
               required
               rows="6"
               placeholder="Share your thoughts, suggestions, or complaints here..."
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className="w-full bg-transparent dark:bg-[#161616] border border-[#e6d5c3] dark:border-[#2a1b12] rounded-lg p-4 text-sm text-gray-900 dark:text-[#d2b48c] focus:ring-2 focus:ring-[#8b4513]/50 focus:border-[#8b4513] outline-none transition-all resize-none shadow-inner"
             ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={status.loading}
            className="w-full py-4 bg-gradient-to-r from-[#8b4513] to-[#5c4033] hover:from-[#a0522d] hover:to-[#8b4513] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {status.loading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : <><FaPaperPlane /> Send Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;