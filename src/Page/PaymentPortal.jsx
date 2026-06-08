import React, { useState, useEffect } from 'react';
import { FaLock, FaCheckCircle, FaPrint, FaArrowRight } from 'react-icons/fa';

const PaymentPortal = ({ currentUser }) => {
  const [step, setStep] = useState('form'); 
  const [formData, setFormData] = useState({
    level: '100L',
    year: '2026',
    session: 'Harmattan Semester',
    amount: '' 
  });
  const [receiptDetails, setReceiptDetails] = useState(null);

  // --- Securely Load Paystack Script without Node Packages ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayClick = (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) return alert("Please enter a valid payment amount");
    
    if (!window.PaystackPop) {
        return alert("The secure gateway is initializing. Please try again in a few moments.");
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY', // ⚠️ Replace with your live or test public key
      email: currentUser?.email || "student@example.com",
      amount: Math.round(Number(formData.amount) * 100), // Converted cleanly to Kobo
      currency: 'NGN', 
      ref: 'AG-' + Math.floor((Math.random() * 1000000000) + 1), // Custom invoice reference string
      metadata: {
        studentId: currentUser?._id,
        fullName: currentUser?.fullName,
        levelToUnlock: formData.level,
        academicYear: formData.year,
        session: formData.session
      },
      callback: function(response) {
        // --- Transaction Successful Execution Flow ---
        setReceiptDetails({
            ...formData,
            trxref: response.reference,
            date: new Date().toLocaleDateString()
        });
        setStep('slip');
      },
      onClose: function() {
        console.log('Secure payment iframe environment closed by client action.');
      }
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] p-4 text-white font-sans">
      
      {/* --- PAYMENT REGISTRATION FORM --- */}
      {step === 'form' && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fadeIn">
          <header className="mb-8 border-b border-white/5 pb-4 text-center">
            <div className="w-12 h-12 bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-900/50">
              <FaLock size={18} />
            </div>
            <h2 className="text-[#d2b48c] font-serif text-2xl uppercase tracking-wide">Clear Portals & Dues</h2>
            <p className="text-stone-500 text-xs mt-2 uppercase tracking-widest">Verify session targets securely</p>
          </header>

          <form onSubmit={handlePayClick} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Target Level Dropdown */}
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 block">Target Level</label>
                <select 
                  value={formData.level}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-[#d2b48c] cursor-pointer"
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                </select>
              </div>

              {/* Typed Academic Year Input */}
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 block">Academic Year</label>
                <input 
                  type="text" 
                  required 
                  value={formData.year}
                  placeholder="e.g., 2025/2026"
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d2b48c]"
                  onChange={e => setFormData({...formData, year: e.target.value})}
                />
              </div>
            </div>

            {/* Session Type Dropdown */}
            <div>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 block">Academic Session</label>
              <select 
                value={formData.session}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-[#d2b48c] cursor-pointer"
                onChange={e => setFormData({...formData, session: e.target.value})}
              >
                <option value="Harmattan Semester">Harmattan Semester</option>
                <option value="Rainy Semester">Rainy Semester</option>
              </select>
            </div>

            {/* Numeric Amount Input */}
            <div>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 block">Amount Payable (₦)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₦</span>
                <input 
                  type="number" 
                  required 
                  placeholder="5000"
                  className="w-full bg-[#111111] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl mt-4 transition-all shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2 text-xs">
              Proceed to Secure Payment <FaArrowRight size={12} />
            </button>
          </form>
        </div>
      )}

      {/* --- RENDERED VERIFIED INVOICE SLIP --- */}
      {step === 'slip' && receiptDetails && (
        <div className="bg-white text-black p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeIn relative overflow-hidden border border-stone-200">
          <div className="absolute top-12 right-6 opacity-[0.04] text-7xl font-black font-serif select-none pointer-events-none transform rotate-12">PAID</div>
          
          <div className="text-center mb-6">
            <FaCheckCircle className="text-emerald-500 text-5xl mx-auto mb-3" />
            <h2 className="text-xl font-serif font-black uppercase tracking-tight text-stone-900">Official Receipt</h2>
            <p className="text-stone-500 text-[10px] font-mono mt-1">REF: {receiptDetails.trxref}</p>
          </div>

          <div className="space-y-3.5 border-y border-stone-100 py-5 mb-6 text-xs">
             <div className="flex justify-between items-center">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest">Student</span>
                <span className="font-bold text-stone-800">{currentUser?.fullName || 'Sanctuary Member'}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest">Academic Target</span>
                <span className="font-bold text-stone-800">{receiptDetails.level} ({receiptDetails.year})</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest">Term Session</span>
                <span className="font-semibold text-stone-800">{receiptDetails.session}</span>
             </div>
             <div className="flex justify-between items-center pt-2 border-t border-stone-50">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest">Amount Settled</span>
                <span className="font-mono font-black text-base text-emerald-600">₦{Number(receiptDetails.amount).toLocaleString()}</span>
             </div>
          </div>

          <button onClick={() => window.print()} className="w-full bg-stone-900 hover:bg-black text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors">
            <FaPrint size={12} /> Print Statement / Save PDF
          </button>
        </div>
      )}

    </div>
  );
};

export default PaymentPortal;