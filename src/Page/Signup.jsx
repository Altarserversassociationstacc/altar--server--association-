import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaTransgender, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/student/signup`, formData);
      // Store email in localStorage to pass to the verification page
      localStorage.setItem('pendingEmail', formData.email);
      navigate('/pending-approval'); // Redirect to the pending approval page
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (name, type, placeholder, Icon, required = true, isPasswordField = false, showPass = false, setShowPass = null) => (
    <div className="relative mb-5 group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-700 group-focus-within:text-green-400 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={isPasswordField ? (showPass ? 'text' : 'password') : type}
      className={`w-full bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 block pl-10 ${isPasswordField ? 'pr-10' : ''} p-3.5 placeholder-gray-600 transition-all outline-none`}
        placeholder={placeholder}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
      />
      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-700 hover:text-green-400 transition-colors"
        >
          {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}
    </div>
  );

  const renderSelectField = (name, placeholder, Icon, options, required = true) => (
    <div className="relative mb-5 group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-700 group-focus-within:text-green-400 transition-colors">
        <Icon size={18} />
      </div>
      <select
      className="w-full bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 block pl-10 p-3.5 appearance-none transition-all outline-none"
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
      >
      <option value="" className="bg-[#041004]">{placeholder}</option>
        {options.map((option) => (
        <option key={option} value={option} className="bg-[#041004]">{option}</option>
        ))}
      </select>
    </div>
  );

  if (isPageLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#041004] flex flex-col items-center justify-center space-y-6 transition-opacity duration-500">
      <PulseLoader color="#22c55e" size={15} margin={3} />
      <p className="text-green-500 text-[10px] uppercase tracking-[0.4em] font-light animate-pulse text-center">Preparing Sanctuary Access</p>
      </div>
    );
  }

  return (
  <div className="min-h-[calc(100vh-80px)] bg-[#041004] flex items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-green-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
    <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Section */}
      <div className="p-8 text-center border-b border-white/5 bg-green-900/10">
        <h2 className="text-3xl font-serif text-white tracking-tight">Register</h2>
        <p className="text-green-500 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Join the Association</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-900/10 border border-red-900/50 text-red-500 text-xs rounded-sm text-center uppercase tracking-widest">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderInputField('fullName', 'text', 'Full Name', FaUser)}
            {renderSelectField('gender', 'Select Gender', FaTransgender, ['Male', 'Female', 'Other'])}
            {renderInputField('email', 'email', 'Email Address', FaEnvelope)}
            {renderInputField('password', 'password', 'Password', FaLock, true, true, showPassword, setShowPassword)}
            {renderInputField('confirmPassword', 'password', 'Confirm Password', FaLock, true, true, showConfirmPassword, setShowConfirmPassword)}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-[#8b4513] hover:bg-[#5c4033] text-white font-bold py-4 px-4 rounded-sm tracking-[0.2em] transition-all duration-300 uppercase text-xs shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <PulseLoader color="#ffffff" size={8} margin={2} />
              ) : (
                <>Create Account <FaArrowRight size={10} /></>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-[#3d2b1f]">
            <p className="text-[#d2b48c] text-xs font-light">
              Already serving? <span onClick={() => navigate('/login')} className="text-[#8b4513] hover:text-white cursor-pointer transition-colors font-bold uppercase ml-1">Login here</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;