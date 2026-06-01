import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaPhoneAlt, FaIdBadge, FaMapMarkerAlt, FaGraduationCap, FaChurch, FaHome, FaCity, FaUserCircle, FaChevronDown, FaLock } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';
import axios from 'axios';

// Pull the API base path endpoint from climate-agnostic environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Enforce structural access security constraints on initial layer mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.isProfileComplete) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    phoneNumber: '',
    regNo: '',
    schoolResidentialAddress: '',
    department: '',
    currentLevel: '100L', // Explicit structural string fallback definition
    levelInducted: '100L',
    stateOfOrigin: '',
    homeTown: '',
    permanentResidence: '',
    homeDiocese: '',
    profilePicture: user?.profilePicture || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState("");
  const [preview, setPreview] = useState(user?.profilePicture || null);

  // Strict year level configurations matching your database model enum boundaries
  const academicLevels = ['100L', '200L', '300L', '400L', '500L'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 150 * 1024) { // 150 KB Threshold safety guardrail limit
      setImageError("Image is too large. Configuration boundary requires files under 150 KB.");
      e.target.value = null; 
      setPreview(null);
    } else if (file) {
      setImageError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(`${API_BASE_URL}/api/student/complete-profile/${user._id}`, formData);
      
      // Update local storage with the newly completed and validated user object context
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      // Parse administrative security interceptor messages dynamically
      const serverMessage = err.response?.data?.message || 'Transaction dropped. Failed to update bio data paths.';
      setError(serverMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (name, type, placeholder, Icon) => (
    <div className="mb-4">
      <label className="text-[10px] text-green-700 font-bold uppercase ml-1 mb-1 block">{placeholder}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-700 group-focus-within:text-green-400 transition-colors">
          <Icon size={14} />
        </div>
        <input
          type={type}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-9 text-gray-300 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
          placeholder={placeholder}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  const renderSelectField = (name, placeholder, options, Icon) => (
    <div className="mb-4">
      <label className="text-[10px] text-green-700 font-bold uppercase ml-1 mb-1 block">{placeholder}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-700 group-focus-within:text-green-400 transition-colors">
          <Icon size={14} />
        </div>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full bg-[#111911] border border-white/10 rounded-xl p-3 pl-9 pr-10 text-gray-300 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition-all appearance-none cursor-pointer"
          required
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#041004] text-white">
              {option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-green-700">
          <FaChevronDown size={10} />
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#041004] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Ambience Overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-green-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-lg bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-fadeIn">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-serif text-white tracking-tight">Complete Your Profile</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-2">Sanctuary Access Verification</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-900/10 border border-red-900/50 text-red-500 text-xs rounded-lg text-center uppercase tracking-widest flex items-center justify-center gap-2">
            <FaLock className="shrink-0" /> {error}
          </div>
        )}
          
        <form onSubmit={handleSubmit}>
          {/* Avatar Component Presentation Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden bg-white/5 relative shadow-inner">
               {preview ? (
                 <img src={preview} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-[10px] text-gray-500 text-center">
                   <FaUserCircle size={24} className="mx-auto mb-1 text-green-700" /> Upload<br/>Photo
                 </span>
               )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4 text-[10px] text-gray-400 w-full max-w-[200px] cursor-pointer" />
            {imageError && <p className="text-red-500 text-[9px] mt-2 font-bold uppercase tracking-widest">{imageError}</p>}
          </div>

          {/* Form Scroll Container */}
          <div className="max-h-[45vh] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-green-900">
            
            {/* Segment A: Academic Coordinates */}
            <h3 className="text-green-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-4 mt-2">Academic Details</h3>
            {renderInputField('regNo', 'text', 'Registration Number', FaIdBadge)}
            {renderInputField('department', 'text', 'Department', FaGraduationCap)}
            
            {/* Dropdown Options matching strict string evaluation keys */}
            {renderSelectField('currentLevel', 'Current Academic Level', academicLevels, FaGraduationCap)}
            {renderSelectField('levelInducted', 'Level Inducted into Guild', academicLevels, FaChurch)}

            {/* Segment B: Personal Metadata */}
            <h3 className="text-green-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-4 mt-6">Personal Details</h3>
            {renderInputField('dateOfBirth', 'date', 'Date of Birth', FaCalendarAlt)}
            {renderInputField('phoneNumber', 'tel', 'Phone Number', FaPhoneAlt)}
            {renderInputField('stateOfOrigin', 'text', 'State of Origin', FaMapMarkerAlt)}
            {renderInputField('homeTown', 'text', 'Home Town', FaHome)}

            {/* Segment C: Geographical and Ecclesiastical Coordinates */}
            <h3 className="text-green-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-4 mt-6">Location & Ecclesiastical Details</h3>
            {renderInputField('schoolResidentialAddress', 'text', 'School Residential Address', FaCity)}
            {renderInputField('permanentResidence', 'text', 'Permanent Residence', FaHome)}
            {renderInputField('homeDiocese', 'text', 'Home Diocese', FaChurch)}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-700 to-green-600 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 flex justify-center"
          >
            {loading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : "Update Bio Data"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;