import React, { useState, useEffect } from 'react';
import { 
  FaLock, FaCheckCircle, FaPrint, FaArrowRight, FaTag, 
  FaCircleNotch, FaExclamationCircle, FaSun, FaMoon, FaHome, FaChevronDown, FaCreditCard
} from 'react-icons/fa';
import PaystackPop from '@paystack/inline-js';

// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:10000";
const CUSTOM_AMOUNT_NARRATIONS = ['Donation', 'Sendforth levy and Appeal fund card'];

const NARRATION_OPTIONS = [
  "Sessional Dues", 
  "Sendforth levy and Appeal fund card", 
  "Donation", 
  "Other Clearance"
];

const LEVEL_OPTIONS = ["100L", "200L", "300L", "400L", "500L"];

// Paystack local transaction fee rules
const PAYSTACK_RULES = {
  LOCAL_PERCENTAGE: 0.015,
  FLAT_FEE_KOBO: 10000,
  CAP_KOBO: 200000,
  THRESHOLD_KOBO: 250000
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const normalizeText = (str) => String(str || '').trim().toLowerCase();

const isCustomAmount = (narration) => 
  CUSTOM_AMOUNT_NARRATIONS.some(n => normalizeText(n) === normalizeText(narration));

/**
 * Real-time Paystack fee breakdown calculator for UI display
 */
const computePaystackBreakdown = (baseAmount) => {
  const num = Number(baseAmount);
  if (!num || num <= 0) return { base: 0, fee: 0, total: 0 };

  const targetInKobo = Math.round(num * 100);
  const { LOCAL_PERCENTAGE, FLAT_FEE_KOBO, CAP_KOBO, THRESHOLD_KOBO } = PAYSTACK_RULES;

  let finalAmountKobo;
  if (targetInKobo < (THRESHOLD_KOBO - (THRESHOLD_KOBO * LOCAL_PERCENTAGE))) {
    finalAmountKobo = targetInKobo / (1 - LOCAL_PERCENTAGE);
  } else {
    finalAmountKobo = (targetInKobo + FLAT_FEE_KOBO) / (1 - LOCAL_PERCENTAGE);
    if ((finalAmountKobo - targetInKobo) > CAP_KOBO) {
      finalAmountKobo = targetInKobo + CAP_KOBO;
    }
  }

  const total = Number((Math.ceil(finalAmountKobo) / 100).toFixed(2));
  const fee = Number((total - num).toFixed(2));

  return { base: num, fee, total };
};

const resolveMatrixAmount = (matrixData, formState) => {
  if (isCustomAmount(formState.narration)) return '';

  const match = matrixData.find(item => 
    normalizeText(item.narration) === normalizeText(formState.narration) &&
    item.targetLevel === formState.level &&
    item.academicYear === formState.year
  ) || matrixData.find(item => 
    normalizeText(item.narration) === normalizeText(formState.narration) &&
    item.targetLevel === formState.level
  ) || matrixData.find(item => 
    normalizeText(item.narration) === normalizeText(formState.narration)
  );

  return match ? match.amount.toString() : '';
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const PaymentPortal = ({ currentUser, onPaymentSuccess, onClose }) => {
  const currentYear = new Date().getFullYear();
  
  // -- State --
  const [step, setStep] = useState('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uiError, setUiError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [dbFeeMatrix, setDbFeeMatrix] = useState([]);
  const [isMatrixLoading, setIsMatrixLoading] = useState(true);
  const [receiptDetails, setReceiptDetails] = useState(null);

  const [formData, setFormData] = useState({
    narration: 'Sessional Dues', 
    level: currentUser?.currentLevel || '100L',
    year: `${currentYear}/${currentYear + 1}`,
    session: `${currentYear}/${currentYear + 1}`,
    amount: '' 
  });

  // -- Real-time Fee Calculation --
  const feeBreakdown = computePaystackBreakdown(formData.amount);

  // -- Fetch Fee Matrix --
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchMatrix = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/payment/fee-matrix`, { signal: controller.signal });
        const output = await res.json();
        
        if (output.success && Array.isArray(output.data)) {
          setDbFeeMatrix(output.data);
          const initialAmount = resolveMatrixAmount(output.data, formData);
          if (initialAmount) setFormData(prev => ({ ...prev, amount: initialAmount }));
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Matrix Sync Error:", err);
      } finally {
        setIsMatrixLoading(false);
      }
    };

    fetchMatrix();
    return () => controller.abort();
  }, []);

  // -- Form Field Handler --
  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'year') updated.session = value;

      if (!isCustomAmount(updated.narration)) {
        updated.amount = resolveMatrixAmount(dbFeeMatrix, updated);
      }
      return updated;
    });
  };

  // -- Backend Verification --
  const verifyBackendPayment = async (reference, numericAmount) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Authentication session expired. Please log in again.");

    const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        reference,
        studentId: currentUser?._id,
        email: currentUser?.email || "student@example.com",
        amount: numericAmount,
        ...formData
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Verification failed.");
    return data;
  };

  // -- Main Payment Handler --
  const handlePayment = async (e) => {
    e.preventDefault();
    setUiError('');

    const numericAmount = Number(formData.amount);
    
    if (!numericAmount || numericAmount <= 0) {
      return setUiError("Please input a valid payment amount.");
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token missing. Please log in.");

      // 1. Initialize Gateway Transaction Server-Side
      const initRes = await fetch(`${API_BASE_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          studentId: currentUser?._id,
          narration: formData.narration,
          level: formData.level,
          academicYear: formData.year,
          session: formData.session,
          amount: numericAmount
        })
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.message || "Gateway initialization failed.");

      const accessCode = initData.access_code || initData.accessCode || initData.data?.access_code;
      if (!accessCode) throw new Error("Gateway failed to generate a transaction access code.");

      const serverBreakdown = initData.breakdown || {
        baseAmount: numericAmount,
        paystackFee: feeBreakdown.fee,
        grossAmount: feeBreakdown.total
      };

      // 2. Resume Transaction via Inline Popup using Backend Access Code
      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        onSuccess: async (response) => {
          setStep('verifying');
          try {
            await verifyBackendPayment(response.reference, numericAmount);
            setReceiptDetails({ 
              ...formData, 
              baseAmount: serverBreakdown.baseAmount,
              paystackFee: serverBreakdown.paystackFee,
              totalPaid: serverBreakdown.grossAmount,
              trxref: response.reference 
            });
            setStep('slip');
            if (onPaymentSuccess) onPaymentSuccess(numericAmount);
          } catch (err) {
            setUiError(`Verification error: ${err.message}`);
            setStep('form');
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: () => setIsProcessing(false),
        onError: () => {
          setIsProcessing(false);
          setUiError("Transaction failed on gateway popup.");
        }
      });

    } catch (err) {
      setIsProcessing(false);
      setUiError(err.message || "Network connection error.");
    }
  };

  // -- Styling Theme --
  const theme = {
    bg: isDarkMode ? 'bg-[#090909] text-white' : 'bg-stone-100 text-stone-900',
    card: isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-stone-200 shadow-stone-300/40',
    input: isDarkMode ? 'bg-[#111111] border-white/10 text-white' : 'bg-stone-50 border-stone-300 text-stone-800',
    mutedText: isDarkMode ? 'text-stone-400' : 'text-stone-500',
  };

  const customAllowed = isCustomAmount(formData.narration);

  if (isMatrixLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors ${theme.bg}`}>
        <FaCircleNotch className="animate-spin text-orange-500 mb-3" size={28} />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-orange-400">Decrypting Portal Parameters...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300 ${theme.bg}`}>
      
      {/* FORM STEP */}
      {step === 'form' && (
        <div className={`backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border relative ${theme.card}`}>
          <button 
            type="button" 
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute top-6 right-6 p-2.5 rounded-full transition-colors border ${isDarkMode ? 'bg-white/5 border-white/10 text-orange-400 hover:bg-white/10' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'}`}
          >
            {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>

          <header className={`mb-8 border-b pb-4 text-center ${isDarkMode ? 'border-white/5' : 'border-stone-100'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border ${isDarkMode ? 'bg-orange-950/30 text-orange-500 border-orange-900/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
              <FaLock size={18} />
            </div>
            <h2 className={`font-serif text-2xl uppercase tracking-wide ${isDarkMode ? 'text-orange-400' : 'text-stone-800 font-bold'}`}>Payment Portal</h2>
            <p className={`text-xs mt-2 uppercase tracking-widest ${theme.mutedText}`}>Verify payment clearance</p>
          </header>

          {uiError && (
            <div role="alert" className={`mb-6 p-4 border rounded-xl flex gap-3 text-xs tracking-wide ${isDarkMode ? 'bg-red-950/40 border-red-900/50 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <FaExclamationCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
              <span>{uiError}</span>
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-5">
            
            {/* 1. Narration Dropdown */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 ${theme.mutedText}`}>
                <FaTag size={10} /> Narration 
              </label>
              <div className="relative">
                <select 
                  disabled={isProcessing} 
                  value={formData.narration}
                  className={`appearance-none w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none transition-colors border ${theme.input} disabled:opacity-60 cursor-pointer`}
                  onChange={e => handleFieldChange('narration', e.target.value)}
                >
                  {NARRATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>

            {/* 2. Level Dropdown */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.mutedText}`}>Level</label>
              <div className="relative">
                <select 
                  disabled={isProcessing} 
                  value={formData.level}
                  className={`appearance-none w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none transition-colors border ${theme.input} disabled:opacity-60 cursor-pointer`}
                  onChange={e => handleFieldChange('level', e.target.value)}
                >
                  {LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>

            {/* 3. Academic Year Input */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.mutedText}`}>Academic Year</label>
              <input 
                type="text" 
                required 
                disabled={isProcessing} 
                value={formData.year} 
                placeholder="e.g. 2025/2026"
                className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors border ${theme.input} disabled:opacity-60`}
                onChange={e => handleFieldChange('year', e.target.value)}
              />
            </div>

            {/* 4. Base Amount Field */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-1 flex justify-between ${theme.mutedText}`}>
                <span>Base Dues Amount</span>
                {!customAllowed && <span className="text-[8px] text-orange-500 font-bold uppercase">Fixed Rate</span>}
              </label>
              <div className="relative mt-1">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ${theme.mutedText}`}>₦</span>
                <input 
                  type="number" 
                  required 
                  min="1"
                  step="any"
                  disabled={isProcessing || !customAllowed} 
                  value={formData.amount} 
                  placeholder="Enter base amount"
                  className={`w-full rounded-xl pl-8 pr-4 py-3 text-sm font-mono focus:outline-none transition-all border ${
                    isDarkMode 
                      ? `bg-[#111111] text-white ${!customAllowed ? 'border-white/5 opacity-60 bg-black/50' : 'border-white/10 focus:border-orange-500'}` 
                      : `bg-stone-50 text-stone-900 ${!customAllowed ? 'border-stone-200 opacity-70 bg-stone-200/50' : 'border-stone-300 focus:border-orange-600'}`
                  }`}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            {/* 5. Live Paystack Charge Breakdown Card */}
            {feeBreakdown.base > 0 && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                isDarkMode ? 'bg-orange-950/20 border-orange-900/40 text-stone-300' : 'bg-orange-50 border-orange-200 text-stone-700'
              }`}>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-orange-500 tracking-wider mb-1">
                  <span className="flex items-center gap-1.5"><FaCreditCard size={10} /> Payment Breakdown</span>
                  <span>Paystack Integrated</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.mutedText}>Base Clearance Dues:</span>
                  <span className="font-mono font-semibold">₦{feeBreakdown.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.mutedText}>Paystack Transaction Charge:</span>
                  <span className="font-mono font-semibold text-orange-400">+₦{feeBreakdown.fee.toLocaleString()}</span>
                </div>
                <div className={`pt-2 border-t flex justify-between font-bold text-sm ${isDarkMode ? 'border-orange-900/40 text-white' : 'border-orange-200 text-stone-900'}`}>
                  <span>Total Debit Amount:</span>
                  <span className="font-mono text-orange-500">₦{feeBreakdown.total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* 6. Complete Payment Button */}
            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-950/70 text-white font-black uppercase tracking-widest py-4 rounded-xl mt-4 flex justify-center items-center gap-2 text-xs transition-all shadow-lg shadow-orange-950/30 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
            >
              {isProcessing ? (
                <><FaCircleNotch className="animate-spin" size={14} /> Contacting Gateway...</>
              ) : (
                <><FaArrowRight size={12} /> Pay ₦{feeBreakdown.total ? feeBreakdown.total.toLocaleString() : '0'} Now</>
              )}
            </button>

          </form>
        </div>
      )}

      {/* VERIFYING STEP */}
      {step === 'verifying' && (
        <div className={`backdrop-blur-xl p-12 rounded-3xl text-center max-w-sm w-full border ${theme.card}`}>
          <FaCircleNotch className="text-orange-500 animate-spin mx-auto mb-4" size={36} />
          <h3 className={`font-serif text-lg ${isDarkMode ? 'text-stone-200' : 'text-stone-800 font-bold'}`}>Verifying Payment</h3>
          <p className={`text-xs mt-1 ${theme.mutedText}`}>Syncing transaction records. Please leave this window open.</p>
        </div>
      )}

      {/* RECEIPT SLIP STEP */}
      {step === 'slip' && receiptDetails && (
        <div className="bg-white text-black p-8 rounded-2xl w-full max-w-sm relative border border-stone-200 shadow-2xl">
          <div className="text-center mb-6">
            <FaCheckCircle className="text-orange-500 text-5xl mx-auto mb-3" />
            <h2 className="text-xl font-serif font-black uppercase tracking-tight">Official Receipt</h2>
            <p className="text-stone-500 text-[10px] font-mono mt-1">REF: {receiptDetails.trxref}</p>
          </div>

          <div className="space-y-3 mb-8 text-xs border-y border-stone-100 py-4">
             <div className="flex justify-between p-2 bg-orange-50 rounded">
                <span className="text-orange-800 font-bold uppercase text-[9px]">Fee Purpose</span>
                <span className="font-bold text-orange-950">{receiptDetails.narration}</span>
             </div>
             <div className="flex justify-between px-2">
                <span className="text-stone-400 font-bold uppercase text-[9px]">Level Scope</span>
                <span className="font-bold text-stone-800">{receiptDetails.level} ({receiptDetails.year})</span>
             </div>
             <div className="flex justify-between px-2">
                <span className="text-stone-400 font-bold uppercase text-[9px]">Base Fee</span>
                <span className="font-mono text-stone-700">₦{(receiptDetails.baseAmount || 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between px-2">
                <span className="text-stone-400 font-bold uppercase text-[9px]">Paystack Charge</span>
                <span className="font-mono text-stone-700">₦{(receiptDetails.paystackFee || 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between px-2 items-center pt-2 border-t border-stone-100">
                <span className="text-stone-800 font-bold uppercase text-[9px]">Total Amount Paid</span>
                <span className="font-mono font-black text-orange-600 text-sm">₦{(receiptDetails.totalPaid || 0).toLocaleString()}</span>
             </div>
          </div>

          <div className="space-y-3 print:hidden">
            <button onClick={() => window.print()} className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer">
              <FaPrint size={12} /> Print / Save PDF
            </button>
            {onClose && (
              <button onClick={onClose} className="w-full bg-white border border-stone-200 text-stone-600 py-3.5 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors cursor-pointer">
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