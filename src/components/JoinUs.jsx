import React from 'react';
import { Link } from 'react-router-dom'; // Keep this import for the Contact Us button

const JoinUs = () => {
  return (
    <section id="join" className="py-24 bg-[#f8f5f2] dark:bg-[#050505] text-gray-900 dark:text-white px-6 border-y border-[#e6d5c3] dark:border-[#2a1b12] relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[#8b4513] rounded-full blur-[200px] opacity-10 pointer-events-none"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif text-[#8b4513] mb-6">
          Ready to Join the ASA Family?
        </h2>
        <p className="text-[#8b4513] dark:text-[#d2b48c] text-xl mb-10 leading-relaxed font-light">
          Become part of a thriving community of liturgical ministers. Access exclusive workshops, 
          spiritual retreats, brotherhood networking, and faith resources.
          </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/signup" className="bg-gradient-to-r from-[#8b4513] to-[#5c4033] hover:from-[#a0522d] hover:to-[#8b4513] text-white font-bold py-4 px-12 rounded-lg tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(139,69,19,0.3)] hover:shadow-[0_0_30px_rgba(139,69,19,0.5)] hover:-translate-y-0.5 uppercase text-sm flex items-center justify-center">
            Apply for Membership
          </Link>
          <Link to="/contact" className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#d2b48c] dark:border-[#3d2b1f] hover:border-[#8b4513] dark:hover:border-[#8b4513] hover:bg-[#f0ece9] dark:hover:bg-[#1a110b] text-[#8b4513] dark:text-[#d2b48c] font-bold py-4 px-12 rounded-lg tracking-widest transition-all duration-300 uppercase text-sm flex items-center justify-center hover:-translate-y-0.5 shadow-lg">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;