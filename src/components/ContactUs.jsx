import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { PulseLoader } from 'react-spinners';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebookF, FaInstagram, FaWhatsapp, FaTwitter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ContactUs = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Form State Management Framework
  const [formFields, setFormFields] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: "How do I become a member of the Association?",
      answer: "Membership is open to all dedicated youth of the Parish who have received their First Holy Communion. Training sessions are held periodically for new servers."
    },
    {
      question: "Can I attend events as a non-member?",
      answer: "Many of our spiritual retreats and community projects are open to all, but liturgical service at the Altar is reserved for trained and active members."
    },
    {
      question: "How can I get involved in Association activities?",
      answer: "Join our official communication groups, follow our social updates, and attend our monthly general meetings held at the Parish Hall."
    },
    {
      question: "How often are executive elections held?",
      answer: "Executive elections are held annually at the end of each session. All active members in good standing are eligible to run for leadership positions."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // 🎯 YOUR INSTANT EMAILJS KEYS MATRIX:
    const SERVICE_ID = "service_cqz256k"; 
    const TEMPLATE_ID = "template_46ofpes"; // Replace this with the Template ID from your URL
    const PUBLIC_KEY = "P05K-omhL0fbdfC3I";   // Replace this with the Public Key from Account settings

    // Prepare variables exactly matching your double curly brace template slots
    const templateParams = {
      fullName: formFields.fullName,
      emailAddress: formFields.emailAddress,
      phoneNumber: formFields.phoneNumber || 'Not Provided',
      subject: formFields.subject,
      message: formFields.message
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        setStatus({ 
          type: 'success', 
          message: 'Message dispatched successfully to the association inbox!' 
        });
        // Clear inputs completely upon verified delivery
        setFormFields({ fullName: '', emailAddress: '', phoneNumber: '', subject: '', message: '' });
      })
      .catch((err) => {
        console.error("❌ [EmailJS Gateway Error]:", err);
        setStatus({ 
          type: 'error', 
          message: 'Network transmission failed. Please try again or reach out directly.' 
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section id="contact" className="py-24 bg-[#050505] text-white px-6 font-sans relative overflow-hidden selection:bg-[#8b4513]/30 selection:text-[#d2b48c]">
      {/* Studio Ambient Background Light */}
      <div className="absolute top-40 right-10 w-[35rem] h-[35rem] bg-[#8b4513] rounded-full blur-[180px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Module Header */}
        <div className="text-center mb-20 space-y-3">
          <h2 className="text-4xl md:text-5xl font-serif text-[#8b4513] uppercase tracking-wider">Get In Touch</h2>
          <p className="text-[#d2b48c]/80 tracking-[0.25em] uppercase text-[10px] font-bold max-w-md mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out to us anytime!
          </p>
        </div>

        {/* Contact Interactivity Informational Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          
          {/* VISIT CARD */}
          <a 
            href="https://maps.google.com/?q=St.+Thomas+Aquinas+Catholic+Chapel+FUTO" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#111111]/80 backdrop-blur-md border border-[#2a1b12] rounded-2xl p-8 text-center shadow-xl group hover:border-[#8b4513]/40 hover:-translate-y-1 transition-all duration-300 block"
          >
            <div className="w-12 h-12 bg-[#8b4513]/10 border border-[#8b4513]/20 rounded-full flex items-center justify-center mx-auto mb-5 text-[#8b4513] group-hover:bg-[#8b4513] group-hover:text-white transition-all duration-300">
              <FaMapMarkerAlt size={18} />
            </div>
            <h3 className="text-[#d2b48c] font-serif text-lg mb-2 tracking-wide">Visit Us</h3>
            <p className="text-gray-400 text-xs font-light">Sanctuary / Sacristy, STACC Parish HQ</p>
            <span className="text-[9px] text-[#8b4513] font-bold uppercase tracking-widest mt-4 block opacity-0 group-hover:opacity-100 transition-opacity">Open Maps Direction →</span>
          </a>

          {/* EMAIL CARD */}
          <a 
            href="mailto:altarserversassociationstacc1@gmail.com?subject=Website%20Inquiry"
            className="bg-[#111111]/80 backdrop-blur-md border border-[#2a1b12] rounded-2xl p-8 text-center shadow-xl group hover:border-[#8b4513]/40 hover:-translate-y-1 transition-all duration-300 block"
          >
            <div className="w-12 h-12 bg-[#8b4513]/10 border border-[#8b4513]/20 rounded-full flex items-center justify-center mx-auto mb-5 text-[#8b4513] group-hover:bg-[#8b4513] group-hover:text-white transition-all duration-300">
              <FaEnvelope size={16} />
            </div>
            <h3 className="text-[#d2b48c] font-serif text-lg mb-2 tracking-wide">Email Us</h3>
            <p className="text-gray-400 text-xs font-light truncate max-w-full px-2 hover:text-white transition-colors">altarserversassociationstacc1@gmail.com</p>
            <span className="text-[9px] text-[#8b4513] font-bold uppercase tracking-widest mt-4 block opacity-0 group-hover:opacity-100 transition-opacity">Launch Mail Client →</span>
          </a>

          {/* PHONE CARD */}
          <div className="bg-[#111111]/80 backdrop-blur-md border border-[#2a1b12] rounded-2xl p-8 text-center shadow-xl group hover:border-[#8b4513]/40 hover:-translate-y-1 transition-all duration-300 block">
            <div className="w-12 h-12 bg-[#8b4513]/10 border border-[#8b4513]/20 rounded-full flex items-center justify-center mx-auto mb-5 text-[#8b4513] group-hover:bg-[#8b4513] group-hover:text-white transition-all duration-300">
              <FaPhoneAlt size={15} />
            </div>
            <h3 className="text-[#d2b48c] font-serif text-lg mb-2 tracking-wide">Call Us</h3>
            <div className="flex flex-col space-y-1 text-gray-400 text-xs font-light">
              <a href="tel:+2349127056239" className="hover:text-white transition-colors">+234 912 705 6239</a>
              <a href="tel:+2348138957245" className="hover:text-white transition-colors">+234 813 895 7245</a>
            </div>
            <span className="text-[9px] text-[#8b4513] font-bold uppercase tracking-widest mt-4 block opacity-0 group-hover:opacity-100 transition-opacity">Click a Line to Call →</span>
          </div>

        </div>

        {/* Messaging Interface Structure Panels */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
          
          {/* Functional Email Form */}
          <div className="bg-[#111111]/90 backdrop-blur-md p-8 md:p-10 border border-[#2a1b12] rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8b4513] via-[#5c4033] to-transparent" />
            <h3 className="text-xl font-serif text-[#d2b48c] mb-8 tracking-wide">Send Us a Message</h3>
            
            {status.message && (
              <div className={`mb-6 p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center ${
                status.type === 'success' ? 'bg-green-900/20 border-green-900/50 text-green-400' : 'bg-red-900/20 border-red-900/50 text-red-400'
              }`}>
                {status.message}
              </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-[#8b4513] font-bold ml-0.5">Full Name *</label>
                  <input required name="fullName" value={formFields.fullName} onChange={handleInputChange} type="text" placeholder="John Doe" className="w-full bg-[#161616] border border-[#2a1b12] rounded-xl p-3.5 text-sm text-[#d2b48c] focus:border-[#8b4513] outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-[#8b4513] font-bold ml-0.5">Email Address *</label>
                  <input required name="emailAddress" value={formFields.emailAddress} onChange={handleInputChange} type="email" placeholder="john@example.com" className="w-full bg-[#161616] border border-[#2a1b12] rounded-xl p-3.5 text-sm text-[#d2b48c] focus:border-[#8b4513] outline-none transition-colors" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-[#8b4513] font-bold ml-0.5">Phone Number</label>
                  <input name="phoneNumber" value={formFields.phoneNumber} onChange={handleInputChange} type="tel" placeholder="+234 ..." className="w-full bg-[#161616] border border-[#2a1b12] rounded-xl p-3.5 text-sm text-[#d2b48c] focus:border-[#8b4513] outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-[#8b4513] font-bold ml-0.5">Subject *</label>
                  <input required name="subject" value={formFields.subject} onChange={handleInputChange} type="text" placeholder="Inquiry category" className="w-full bg-[#161616] border border-[#2a1b12] rounded-xl p-3.5 text-sm text-[#d2b48c] focus:border-[#8b4513] outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8b4513] font-bold ml-0.5">Message Content *</label>
                <textarea required name="message" value={formFields.message} onChange={handleInputChange} rows="4" placeholder="Type structural details regarding your inquiry..." className="w-full bg-[#161616] border border-[#2a1b12] rounded-xl p-3.5 text-sm text-[#d2b48c] focus:border-[#8b4513] outline-none resize-none transition-colors" />
              </div>
              
              <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-[#8b4513] to-[#5c4033] hover:brightness-110 py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.25em] text-white shadow-lg transform active:scale-[0.99] transition-all duration-300 mt-2 disabled:opacity-50 flex items-center justify-center">
                {loading ? <PulseLoader color="#ffffff" size={6} /> : "Dispatch Message File"}
              </button>
            </form>
          </div>

          {/* Core Media Directories Sidebar */}
          <div className="space-y-12 lg:pl-6">
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-[#d2b48c] tracking-wide">Find Us</h3>
              <div className="bg-[#111111]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#2a1b12] border-l-4 border-l-[#8b4513] shadow-lg space-y-1">
                <h4 className="font-bold text-xs uppercase text-gray-200">Campus Chapel Parish Location</h4>
                <p className="text-gray-400 text-xs italic font-normal">St. Thomas Aquinas Catholic Chapel (STACC), Altar Servers Sacristy, FUTO Campus, Owerri.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-serif text-[#d2b48c] tracking-wide">Connect With Us</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-light">
                Follow our official social networks for live media updates, liturgical training alerts, and spiritual service opportunities within our guild.
              </p>
              
              {/* Media Handles Link Wrapper List */}
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { icon: <FaFacebookF size={13} />, url: "https://facebook.com/yourguildpage", label: "Facebook" },
                  { icon: <FaInstagram size={13} />, url: "https://instagram.com/yourguildhandle", label: "Instagram" },
                  { icon: <FaWhatsapp size={14} />, url: "https://wa.me/2349127056239", label: "WhatsApp Chat" },
                  { icon: <FaTwitter size={13} />, url: "https://twitter.com/yourguildhandle", label: "Twitter" }
                ].map((social, index) => (
                  <a 
                    key={index} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title={social.label}
                    className="w-11 h-11 rounded-xl border border-[#2a1b12] bg-[#111111] flex items-center justify-center text-gray-400 hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-white transform active:scale-90 transition-all duration-300 shadow-md"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Presentation Layer Block */}
        <div className="max-w-4xl mx-auto border-t border-[#2a1b12] pt-20">
          <h3 className="text-3xl font-serif text-center text-[#8b4513] uppercase tracking-wider mb-12">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="border-b border-[#2a1b12]/60 last:border-none">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full py-5 flex justify-between items-center text-left hover:text-[#d2b48c] group transition-colors focus:outline-none"
                  >
                    <span className="font-serif text-base tracking-wide text-gray-200 group-hover:text-[#d2b48c] transition-colors">{faq.question}</span>
                    <span className="text-[#8b4513] ml-4 flex-shrink-0 transition-transform duration-300">
                      {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </span>
                  </button>
                  
                  {/* Accordion Expansion Slider */}
                  <div className={`overflow-hidden transition-all duration-500 max-h-0 ${isOpen ? 'max-h-40 pb-6' : ''}`}>
                    <p className="text-gray-400 text-xs leading-relaxed font-light px-0.5">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Back To Top Scroll Anchoring */}
      <div className="mt-28 text-center">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-[9px] uppercase tracking-[0.4em] text-gray-600 hover:text-[#8b4513] transition-all font-bold focus:outline-none"
        >
          ↑ Back to Top
        </button>
      </div>
    </section>
  );
};

export default ContactUs;