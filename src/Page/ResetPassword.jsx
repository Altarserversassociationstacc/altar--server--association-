import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/reset-password/${token}`, { password });
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (placeholder, value, onChange) => (
    <div className="relative mb-5 group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-700 group-focus-within:text-green-400 transition-colors">
        <FaLock size={18} /> 
      </div>
      <input type={showPassword ? 'text' : 'password'} className="w-full bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 block pl-10 pr-10 p-3.5 placeholder-gray-600 transition-all outline-none" placeholder={placeholder} value={value} onChange={onChange} required minLength="6" />
      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-700 hover:text-green-400 transition-colors">
        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
      </button>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#041004] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-green-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8 text-center border-b border-white/5 bg-green-900/10">
          <h2 className="text-3xl font-serif text-white tracking-tight">Set New Password</h2>
          <p className="text-green-500 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Secure your account</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-900/10 border border-red-900/50 text-red-500 text-xs rounded-sm text-center uppercase tracking-widest">
              {error}
            </div>
          )}
          {success ? (
            <div className="mb-6 p-3 bg-green-900/10 border border-green-900/50 text-green-500 text-xs rounded-sm text-center uppercase tracking-widest">
              {success}<br /><br />Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-gray-300 text-sm mb-6 font-light">Create a new, strong password below.</p>
              {renderPasswordField('New Password', password, (e) => setPassword(e.target.value))}
              {renderPasswordField('Confirm New Password', confirmPassword, (e) => setConfirmPassword(e.target.value))}

              <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-4 px-4 rounded-xl tracking-[0.2em] transition-all duration-300 uppercase text-[10px] shadow-lg hover:shadow-green-900/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                {loading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : <>Update Password <FaArrowRight size={10} /></>}
              </button>
            </form>
          )}
          
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-gray-400 text-xs font-light">
              Changed your mind? <span onClick={() => navigate('/login')} className="text-green-500 hover:text-white cursor-pointer transition-colors font-bold uppercase ml-1">Cancel</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;