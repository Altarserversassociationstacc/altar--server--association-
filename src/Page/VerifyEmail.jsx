import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaArrowRight, FaSyncAlt } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Retrieve email from navigation state or localStorage
    const pendingEmail = location.state?.email || localStorage.getItem('pendingEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      setError("Email context missing. Please try logging in to verify your account.");
    }
  }, [location]);

  // Countdown timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    const val = element.value.slice(-1);
    if (!/^\d?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Move focus to next input if digit entered
    if (val !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 6).split("");
    if (data.length === 6 && data.every(d => !isNaN(d))) {
      setOtp(data);
      inputRefs.current[5].focus();
    }
  };

  const verifyCode = async (codeToVerify) => {
    if (loading || success) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!email) {
        throw new Error("Email is missing. Please try logging in again.");
      }

      const response = await axios.post(`${API_BASE_URL}/api/student/verify`, {
        email: email,
        code: codeToVerify
      });
      
      setSuccess(response.data.message);
      localStorage.removeItem('pendingEmail');
      // Automatically navigate to login after success as requested
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please check your email.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCode(otp.join(""));
  };

  const handleResend = async () => {
    if (resending || timer > 0) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/resend-code`, { email });
      setSuccess(response.data.message);
      setTimer(60); // Reset 60s timer on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#041004] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-green-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
        <div className="p-8 text-center border-b border-white/5 bg-green-900/10">
          <h2 className="text-3xl font-serif text-white tracking-tight">Verify Access</h2>
          <p className="text-green-500 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Enter Authentication Code</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-3 bg-red-900/10 border border-red-900/50 text-red-500 text-xs rounded-sm text-center uppercase tracking-widest">{error}</div>}
          {success && <div className="mb-6 p-3 bg-green-900/10 border border-green-900/50 text-green-500 text-xs rounded-sm text-center uppercase tracking-widest">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <p className="text-gray-300 text-sm mb-6 font-light text-center leading-relaxed">
              A 6-digit verification code has been sent to your registered email: <br/>
              <span className="text-green-400 font-bold tracking-tight">{email}</span>
            </p>

            <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 bg-white/5 border border-white/10 text-white text-2xl text-center font-mono rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                  required
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading || otp.join("").length !== 6} 
              className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-4 px-4 rounded-xl tracking-[0.2em] transition-all duration-300 uppercase text-[10px] shadow-lg hover:shadow-green-900/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : <>Verify Account <FaArrowRight size={10} /></>}
            </button>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-gray-400 text-xs font-light">
              Didn't receive the code? 
              <button 
                onClick={handleResend} 
                disabled={resending || timer > 0} 
                className="text-green-500 hover:text-white cursor-pointer transition-colors font-bold uppercase ml-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {resending ? 'Sending...' : timer > 0 ? `Resend Code in ${timer}s` : <><FaSyncAlt size={10} /> Resend Code</>}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;