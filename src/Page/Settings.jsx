import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaPhoneAlt, FaCamera, FaSave, FaLock, FaChevronDown } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Settings = ({ user, setCurrentUser }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    schoolResidentialAddress: user?.schoolResidentialAddress || '',
    profilePicture: user?.profilePicture || '',
    department: user?.department || '',
    currentLevel: user?.currentLevel || '100L',
    regNo: user?.regNo || '',
    homeTown: user?.homeTown || '',
    stateOfOrigin: user?.stateOfOrigin || '',
    homeDiocese: user?.homeDiocese || '',
    permanentResidence: user?.permanentResidence || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    levelInducted: user?.levelInducted || '100L',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ error: '', success: '' });

  // 🛡️ SOPHISTICATED STATE EVALUATION
  const isProfileLocked = user?.accountStatus === 'Locked' || user?.accountStatus === 'Suspended' || user?.accountStatus === 'Dormant';

  const academicLevels = ['100L', '200L', '300L', '400L', '500L'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 150 * 1024) { 
      setStatus({ error: 'Image asset is too large. Must be under 150 KB.', success: '' });
      e.target.value = null;
    } else if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ error: '', success: '' });

    try {
      const response = await axios.put(`${API_BASE_URL}/api/student/complete-profile/${user._id}`, formData);
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (setCurrentUser) setCurrentUser(response.data.user);
      setStatus({ error: '', success: 'Profile configurations synchronized successfully!' });
      setTimeout(() => setStatus({ error: '', success: '' }), 4000);
    } catch (err) {
      setStatus({ error: err.response?.data?.message || 'Transaction dropped. Failed to update profile.', success: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleLockProfile = async () => {
    if (window.confirm("Are you sure you want to lock your profile? You will not be able to edit it again without Admin approval.")) {
      setLoading(true);
      setStatus({ error: '', success: '' });
      try {
        const response = await axios.put(`${API_BASE_URL}/api/student/lock-profile/${user._id}`);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (setCurrentUser) setCurrentUser(response.data.user);
        setStatus({ error: '', success: 'Profile has been securely locked and session state finalized.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setStatus({ error: err.response?.data?.message || 'Failed to lock profile.', success: '' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="animate-fadeIn font-sans select-none pb-12">
      <h2 className="text-2xl font-serif text-[#d2b48c] mb-6">Account Settings</h2>

      <div className="bg-[#111111]/80 backdrop-blur-md border border-[#2a1b12] p-6 md:p-8 rounded-xl shadow-xl max-w-4xl">
        
        {/* Profile Avatar Frame Layer Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-[#2a1b12] pb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full border-2 border-[#3d2b1f] overflow-hidden bg-[#1a110b] flex items-center justify-center group-hover:border-green-500 transition-colors shadow-inner">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-[#d2b48c] w-1/2 h-1/2" />
              )}
            </div>
            {!isProfileLocked && (
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FaCamera className="text-white" size={24} />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-white font-serif text-xl">{formData.fullName || user?.fullName}</h3>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Reg No: {formData.regNo || 'Pending'}</p>
            {!isProfileLocked && (
              <label className="mt-3 inline-block px-4 py-2 bg-[#161616] border border-[#2a1b12] hover:border-[#3d2b1f] text-xs font-bold text-[#d2b48c] uppercase tracking-widest rounded-lg transition-all cursor-pointer">
                Change Avatar
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {status.error && <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 text-red-500 text-xs rounded-lg text-center uppercase tracking-widest">{status.error}</div>}
        {status.success && <div className="mb-6 p-4 bg-green-900/20 border border-green-900/50 text-green-500 text-xs rounded-lg text-center uppercase tracking-widest">{status.success}</div>}
        
        {isProfileLocked && (
          <div className="mb-8 p-6 bg-yellow-900/10 border border-yellow-900/30 rounded-xl flex items-center gap-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-yellow-900/20 text-yellow-600 flex items-center justify-center shrink-0">
              <FaLock size={20} />
            </div>
            <div>
              <h3 className="text-yellow-600 font-bold uppercase tracking-widest text-xs">Portal Control Status: {user?.accountStatus}</h3>
              <p className="text-gray-400 text-[10px] mt-1">{user?.statusReason || 'Your profile details have been securely locked. Please contact the Administrator if you need to make modifications.'}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={isProfileLocked || loading} className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-100 disabled:opacity-60 transition-opacity">
            
            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><FaUser size={14} /></div>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg pl-10 p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><FaPhoneAlt size={14} /></div>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg pl-10 p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Registration No</label>
              <input type="text" name="regNo" value={formData.regNo} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
            </div>

            <div className="relative">
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Current Academic Level</label>
              <div className="relative">
                <select name="currentLevel" value={formData.currentLevel} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 pr-10 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all appearance-none cursor-pointer">
                  {academicLevels.map(lvl => <option key={lvl} value={lvl} className="bg-[#111111]">{lvl}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8b4513]"><FaChevronDown size={10} /></div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Level Inducted into Guild</label>
              <div className="relative">
                <select name="levelInducted" value={formData.levelInducted} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 pr-10 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all appearance-none cursor-pointer">
                  {academicLevels.map(lvl => <option key={lvl} value={lvl} className="bg-[#111111]">{lvl}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8b4513]"><FaChevronDown size={10} /></div>
              </div>
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">State of Origin</label>
              <input type="text" name="stateOfOrigin" value={formData.stateOfOrigin} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Home Town</label>
              <input type="text" name="homeTown" value={formData.homeTown} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
            </div>

            <div>
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Home Diocese</label>
              <input type="text" name="homeDiocese" value={formData.homeDiocese} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">School Residential Address</label>
              <input type="text" name="schoolResidentialAddress" value={formData.schoolResidentialAddress} onChange={handleChange} className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" required />
            </div>

            {/* Field: Permanent Residence - Typo Fixed here */}
            <div className="md:col-span-2">
              <label className="block text-[#8b4513] text-[10px] font-bold uppercase tracking-widest mb-2">Permanent Residence</label>
              <input 
                type="text" 
                name="permanentResidence" 
                value={formData.permanentResidence} 
                onChange={handleChange} 
                className="w-full bg-[#161616] border border-[#2a1b12] rounded-lg p-3.5 text-sm text-[#d2b48c] outline-none focus:border-green-500 transition-all" 
                required 
              />
            </div>
          </fieldset>
          
          {!isProfileLocked && (
            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-[#2a1b12]">
              <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all">
                {loading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : <><FaSave /> Save Changes</>}
              </button>
              <button type="button" onClick={handleLockProfile} disabled={loading} className="w-full md:w-auto px-8 py-4 bg-[#161616] border border-red-900/50 hover:bg-red-900/20 text-red-500 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-3">
                <FaLock /> Lock Profile
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;