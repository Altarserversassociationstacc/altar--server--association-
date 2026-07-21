import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FaLock, FaCheckCircle, FaPrint, FaArrowRight, FaTag, 
  FaCircleNotch, FaExclamationCircle, FaSun, FaMoon, FaHome, FaChevronDown 
} from 'react-icons/fa';
import PaystackPop from '@paystack/inline-js';

const CUSTOM_AMOUNT_NARRATIONS = ['Donation', 'Sendforth levy and Appeal fund card'];

const PaymentPortal = ({ currentUser, onPaymentSuccess, onClose }) => {
  const [step, setStep] = useState('form'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [uiError, setUiError] = useState('');
  
  // 🌓 Theme State Control
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 🗄️ State to hold dynamic admin-controlled matrix values
  const [dbFeeMatrix, setDbFeeMatrix] = useState({});
  const [isMatrixLoading, setIsMatrixLoading] = useState(true);

  const [formData, setFormData] = useState({
    narration: 'Sessional Dues', 
    level: '400L',
    year: '2025/2026',
    session: 'Harmattan Semester',
    amount: '5000' 
  });
  
  const [receiptDetails, setReceiptDetails] = useState(null);
  const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:10000";

  // Refs prevent stale closures inside the Paystack callback instance
  const formDataRef = useRef(formData);
  const currentUserRef = useRef(currentUser);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // 📡 Sync & Pull Latest Admin Fee Rules
  useEffect(() => {
    const controller = new AbortController();

    const fetchMatrix = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/payment/fee-matrix`, { 
          signal: controller.signal 
        });
        const output = await res.json();
        
        if (output.success) {
          const matrixMap = {};
          output.data.forEach(item => {
            matrixMap[item.narration] = item.amount;
          });
          
          // Free-form inputs mapped
          CUSTOM_AMOUNT_NARRATIONS.forEach(nar => {
            matrixMap[nar] = '';
          });
          
          setDbFeeMatrix(matrixMap);
          
          if (matrixMap['Sessional Dues']) {
            setFormData(prev => ({ ...prev, amount: matrixMap['Sessional Dues'].toString() }));
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Could not coordinate system fee matrices:", err);
        }
      } finally {
        setIsMatrixLoading(false);
      }
    };

    fetchMatrix();
    return () => controller.abort();
  }, [API_BASE_URL]);

  const isCustomAmountAllowed = CUSTOM_AMOUNT_NARRATIONS.includes(formData.narration);

  // Gateway fee computation
  const calculatePaystackTotalCharge = useCallback((baseAmountNaira) => {
    if (baseAmountNaira <= 0) return 0;
    const flatFee = baseAmountNaira >= 2500 ? 100 : 0;
    const computedTotal = (baseAmountNaira + flatFee) / (1 - 0.015);
    const totalWithCap = computedTotal - baseAmountNaira > 2000 ? baseAmountNaira + 2000 : computedTotal;
    return Math.round(totalWithCap);
  }, []);

  const verifyPaymentOnBackend = async (reference, numericAmount, currentFormData) => {
    const token = localStorage.getItem('token'); 
    if (!token) throw new Error("Authentication token is missing. Please log in again.");

    const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        reference,
        studentId: currentUserRef.current?._id,
        email: currentUserRef.current?.email || "student@example.com",
        amount: numericAmount,
        ...currentFormData
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Verification step failed.");
    return data;
  };

  const handlePayClick = async (e) => {
    e.preventDefault();
    setUiError('');

    const currentFormData = formDataRef.current;
    const numericAmount = Number(currentFormData.amount.toString().replace(/,/g, ''));

    if (!numericAmount || numericAmount <= 0) {
      return setUiError("Please input a valid amount to proceed.");
    }

    const paystackKey = import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) return setUiError("Gateway credentials missing. Contact administrator.");

    setIsProcessing(true);
    const uniqueRef = `AG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error("Authentication token missing.");
      }

      const finalGrossUserCharge = calculatePaystackTotalCharge(numericAmount);

      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: paystackKey, 
        email: currentUserRef.current?.email || "student@example.com", 
        amount: Math.round(finalGrossUserCharge * 100), 
        currency: 'NGN', 
        reference: uniqueRef, 
        firstname: currentUserRef.current?.firstName || currentUserRef.current?.studentName?.split(' ')[0] || "Student",
        lastname: currentUserRef.current?.lastName || currentUserRef.current?.studentName?.split(' ')[1] || "Portal",
        metadata: {
          studentId: currentUserRef.current?._id,
          custom_fields: [
            { display_name: "Narration", variable_name: "narration", value: currentFormData.narration },
            { display_name: "Target Level", variable_name: "level", value: currentFormData.level },
            { display_name: "Academic Year", variable_name: "academic_year", value: currentFormData.year },
            { display_name: "Session", variable_name: "session", value: currentFormData.session }
          ]
        },
        onSuccess: (response) => {
          setStep('verifying');
          verifyPaymentOnBackend(response.reference, numericAmount, currentFormData)
            .then(() => {
              setReceiptDetails({ 
                ...currentFormData, 
                cleanAmount: numericAmount, 
                trxref: response.reference, 
                date: new Date().toLocaleDateString() 
              });
              setStep('slip');
              
              if (onPaymentSuccess) onPaymentSuccess(numericAmount);
            })
            .catch((err) => {
              setUiError(`Verification error: ${err.message}. Reference: ${response.reference}`);
              setStep('form');
            })
            .finally(() => setIsProcessing(false));
        },
        onCancel: () => setIsProcessing(false),
        onError: () => { 
          setIsProcessing(false); 
          setUiError("Gateway initialization interrupted or failed."); 
        }
      });

    } catch (err) {
      setIsProcessing(false);
      setUiError(err.message || "Network interface interrupted execution.");
    }
  };

  const onSelectChangeHandler = (e) => {
    const value = e.target.value;
    const matrixAmount = dbFeeMatrix[value];
    
    setFormData(prev => ({
      ...prev,
      narration: value,
      amount: matrixAmount !== undefined && matrixAmount !== '' ? matrixAmount.toString() : ''
    }));
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#090909] text-white' : 'bg-stone-100 text-stone-900',
    card: isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-stone-200 shadow-stone-300/40',
    input: isDarkMode ? 'bg-[#111111] border-white/10 text-white' : 'bg-stone-50 border-stone-300 text-stone-800',
    mutedText: isDarkMode ? 'text-stone-400' : 'text-stone-500',
  };

  if (isMatrixLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme.bg}`}>
        <FaCircleNotch className="animate-spin text-[#d2b48c] mb-3" size={28} />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#d2b48c]">Decrypting Portal Parameters...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300 ${theme.bg}`}>
      
      {step === 'form' && (
        <div className={`backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border transition-all duration-300 ${theme.card}`}>
          
          <header className={`mb-8 border-b pb-4 text-center relative ${isDarkMode ? 'border-white/5' : 'border-stone-100'}`}>
            <button 
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`absolute top-0 right-0 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900/40 border-zinc-800 text-amber-400 hover:bg-zinc-800' 
                  : 'bg-stone-50 border-stone-200 text-indigo-600 hover:bg-stone-100'
              }`}
              title={isDarkMode ? "Switch to Light Layout" : "Switch to Dark Layout"}
            >
              {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
            </button>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border ${isDarkMode ? 'bg-amber-950/30 text-amber-500 border-amber-900/50' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              <FaLock size={18} />
            </div>
            <h2 className={`font-serif text-2xl uppercase tracking-wide ${isDarkMode ? 'text-[#d2b48c]' : 'text-stone-800 font-bold'}`}>Payments Portal</h2>
            <p className={`text-xs mt-2 uppercase tracking-widest ${theme.mutedText}`}>Verify session targets securely</p>
          </header>

          {uiError && (
            <div className={`mb-6 p-4 border rounded-xl flex items-start gap-3 text-xs tracking-wide ${isDarkMode ? 'bg-red-950/40 border-red-900/50 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <FaExclamationCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
              <span>{uiError}</span>
            </div>
          )}

          <form onSubmit={handlePayClick} className="space-y-5">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>
                <FaTag size={10} /> Payment Narration 
              </label>
              {/* ✅ FIX APPLIED HERE: appearance-none added, and relative div wrapper with FaChevronDown */}
              <div className="relative">
                <select 
                  disabled={isProcessing}
                  value={formData.narration}
                  className={`appearance-none w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none transition-colors duration-200 border ${theme.input}`}
                  onChange={onSelectChangeHandler}
                >
                  <option value="Sessional Dues">Sessional Dues (Unlocks Profile)</option>
                  <option value="Sendforth levy and Appeal fund card">Sendforth levy and Appeal fund card</option>
                  <option value="Donation">Donation </option>
                  <option value="Other Clearance">Other Clearance</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                  <FaChevronDown size={12} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.mutedText}`}>Target Level</label>
                {/* ✅ FIX APPLIED HERE */}
                <div className="relative">
                  <select 
                    disabled={isProcessing}
                    value={formData.level}
                    className={`appearance-none w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none transition-colors duration-200 border ${theme.input}`}
                    onChange={e => setFormData(prev => ({...prev, level: e.target.value}))}
                  >
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                    <option value="500L">500L</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <FaChevronDown size={12} />
                  </div>
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.mutedText}`}>Academic Year</label>
                <input 
                  type="text" required disabled={isProcessing} value={formData.year}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 border ${theme.input}`}
                  onChange={e => setFormData(prev => ({...prev, year: e.target.value}))}
                />
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between ${theme.mutedText}`}>
                <span>Amount</span>
                {!isCustomAmountAllowed && <span className="text-[8px] text-amber-500 font-bold">Admin Managed</span>}
              </label>
              <div className="relative mt-1">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ${theme.mutedText}`}>₦</span>
                <input 
                  type="number" required 
                  disabled={isProcessing || !isCustomAmountAllowed} 
                  value={formData.amount}
                  placeholder="Enter amount"
                  className={`w-full rounded-xl pl-8 pr-4 py-3 text-sm font-mono focus:outline-none transition-all border ${
                    isDarkMode 
                      ? `bg-[#111111] text-white ${!isCustomAmountAllowed ? 'border-white/5 opacity-60 cursor-not-allowed bg-black/50' : 'border-white/10 focus:border-emerald-500'}` 
                      : `bg-stone-50 text-stone-900 ${!isCustomAmountAllowed ? 'border-stone-200 opacity-70 cursor-not-allowed bg-stone-200/50' : 'border-stone-300 focus:border-emerald-600'}`
                  }`}
                  onChange={e => setFormData(prev => ({...prev, amount: e.target.value}))}
                />
              </div>
              {formData.amount && (
                <p className={`text-[9px] font-medium mt-1.5 tracking-wide uppercase ${isDarkMode ? 'text-amber-400/80' : 'text-amber-600/90'}`}>
                  * Note: Paystack platform handling gateway surcharges will be computed at payment step.
                </p>
              )}
            </div>

            <button 
              type="submit" disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/80 text-white font-black uppercase tracking-widest py-4 rounded-xl mt-4 flex justify-center items-center gap-2 text-xs transition-all cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              {isProcessing ? (
                <><FaCircleNotch className="animate-spin" size={14} /> Contacting Bank Gateway...</>
              ) : (
                <><FaArrowRight size={12} /> Complete Secure Payment</>
              )}
            </button>
          </form>
        </div>
      )}

      {step === 'verifying' && (
        <div className={`backdrop-blur-xl p-12 rounded-3xl text-center max-w-sm w-full border transition-all duration-300 ${theme.card}`}>
          <FaCircleNotch className="text-emerald-500 animate-spin mx-auto mb-4" size={36} />
          <h3 className={`font-serif text-lg ${isDarkMode ? 'text-stone-200' : 'text-stone-800 font-bold'}`}>Verifying Ledger Payment</h3>
          <p className={`text-xs mt-1 ${theme.mutedText}`}>Syncing cryptographic records. Please preserve this display screen open.</p>
        </div>
      )}

      {step === 'slip' && receiptDetails && (
        <div className="bg-white text-black p-8 rounded-2xl w-full max-w-sm relative border border-stone-200 shadow-2xl animate-fadeIn">
          <div className="text-center mb-6">
            <FaCheckCircle className="text-emerald-500 text-5xl mx-auto mb-3" />
            <h2 className="text-xl font-serif font-black uppercase tracking-tight text-stone-900">Official Invoice Receipt</h2>
            <p className="text-stone-500 text-[10px] font-mono mt-1">REF: {receiptDetails.trxref}</p>
          </div>

          <div className="space-y-3 mb-8 text-xs border-y border-stone-100 py-4">
             <div className="flex justify-between p-2 bg-emerald-50 rounded">
                <span className="text-emerald-800 font-bold uppercase text-[9px]">Fee Purpose</span>
                <span className="font-bold text-emerald-900">{receiptDetails.narration}</span>
             </div>
             <div className="flex justify-between px-2">
                <span className="text-stone-400 font-bold uppercase text-[9px]">Level Scope</span>
                <span className="font-bold text-stone-800">{receiptDetails.level} ({receiptDetails.year})</span>
             </div>
             <div className="flex justify-between px-2 items-center">
                <span className="text-stone-400 font-bold uppercase text-[9px]">Settled Amount</span>
                <span className="font-mono font-black text-emerald-600 text-sm">₦{receiptDetails.cleanAmount.toLocaleString()}</span>
             </div>
          </div>

          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => window.print()} 
              className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-800 transition-colors"
            >
              <FaPrint size={12} /> Print Statement / Save PDF
            </button>
            
            {onClose && (
              <button 
                type="button"
                onClick={onClose} 
                className="w-full bg-white border border-stone-200 text-stone-600 py-3.5 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-50 transition-colors"
              >
                <FaHome size={12} /> Return to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPortal;