import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';
import axios from 'axios';

// 🎯 Network Alignment Layer: Connects seamlessly to Render production url or defaults locally
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/login`, formData);
      
      // Store the logged-in user's information and secure token in the browser's localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      
      setIsRedirecting(true);
      
      setTimeout(() => {
        if (!response.data.user.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
      
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      
      // Handle account state errors (Not approved or not verified)
      if (err.response?.status === 403) {
        if (message.toLowerCase().includes('approved')) {
          setTimeout(() => navigate('/pending-approval'), 2000);
        } else if (message.toLowerCase().includes('verify')) {
          localStorage.setItem('pendingEmail', formData.email);
          setTimeout(() => navigate('/verify-email'), 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ Optimized Component Input Macro Renderer
  const renderInputField = (name, type, placeholder, Icon, required = true, isPasswordField = false) => (
    <div className="relative mb-5 group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8b4513] dark:text-[#d2b48c] opacity-70 group-focus-within:opacity-100 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
        className="w-full bg-transparent dark:bg-white/5 border border-[#e6d5c3] dark:border-white/10 text-gray-900 dark:text-gray-300 text-sm rounded-xl focus:ring-2 focus:ring-[#8b4513]/50 focus:border-[#8b4513] block pl-10 pr-10 p-3.5 placeholder-gray-500 dark:placeholder-gray-600 transition-all outline-none"
        placeholder={placeholder}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
      />
      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)} // 🎯 Fixed: Directly targets state closure context safely
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8b4513] dark:text-[#d2b48c] hover:opacity-80 transition-colors"
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}
    </div>
  );

  if (isPageLoading || isRedirecting) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f8f5f2] dark:bg-[#050505] flex flex-col items-center justify-center space-y-6 transition-colors duration-500 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-[#8b4513] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        <PulseLoader color="#8b4513" size={15} margin={3} />
        <p className="text-[#8b4513] dark:text-[#d2b48c] text-[10px] uppercase tracking-[0.4em] font-light animate-pulse text-center">
          {isRedirecting ? "Verifying Credentials..." : "Accessing Sanctuary"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8f5f2] dark:bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-[#8b4513] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="max-w-md w-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-[#e6d5c3] dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
        <div className="p-8 text-center border-b border-[#e6d5c3] dark:border-white/5 bg-[#8b4513]/5"> 
          <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">Login</h2> 
          <p className="text-[#8b4513] dark:text-[#d2b48c] text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Welcome Back, Server</p> 
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-900/10 border border-red-900/50 text-red-500 text-xs rounded-sm text-center uppercase tracking-widest">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderInputField('email', 'email', 'Email Address', FaEnvelope)}
            {renderInputField('password', 'password', 'Password', FaLock, true, true)}

            <div className="flex justify-end mb-4">
              <span onClick={() => navigate('/forgot-password')} className="text-gray-600 dark:text-gray-400 hover:text-[#8b4513] dark:hover:text-[#d2b48c] cursor-pointer transition-colors text-xs font-light">Forgot Password?</span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-[#8b4513] to-[#5c4033] hover:from-[#a0522d] hover:to-[#8b4513] text-white font-bold py-4 px-4 rounded-xl tracking-[0.2em] transition-all duration-300 uppercase text-xs shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : <>Login <FaArrowRight size={10} /></>}
            </button>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-[#e6d5c3] dark:border-white/5">
            <p className="text-gray-600 dark:text-gray-400 text-xs font-light">
              Not yet a server? <span onClick={() => navigate('/signup')} className="text-[#8b4513] dark:text-[#d2b48c] hover:underline cursor-pointer transition-colors font-bold uppercase ml-1">Register here</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;