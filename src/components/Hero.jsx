import React from 'react';
import heroBg from '../assets/image.png';
import { FaArrowRight } from 'react-icons/fa';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden group/hero bg-[#f8f5f2] dark:bg-[#050505] transition-colors duration-500">
      {/* Professional Hero Background with clear visibility */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-40 bg-cover bg-top bg-no-repeat pointer-events-none transition-transform duration-[2000ms] group-hover/hero:scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f5f2] dark:from-[#050505] via-transparent to-[#f8f5f2] dark:to-[#050505] pointer-events-none transition-colors duration-500" />
      <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[0.5px] pointer-events-none transition-colors duration-500" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-serif text-gray-900 dark:text-white leading-[1.1] tracking-tight animate-fadeIn">
            Serving at the <span className="text-[#d2b48c]">Holy Altar</span> <br /> 
            with <span className="italic">Reverence</span>.
          </h1>
          
          <p className="text-gray-700 dark:text-gray-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Connecting brothers and sisters dedicated to the service of the church and the community.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
          <button className="w-full sm:w-auto bg-[#8b4513] hover:bg-[#a0522d] text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl hover:-translate-y-1">
            Latest Updates
          </button>
          <button className="w-full sm:w-auto bg-[#8b4513]/10 dark:bg-white/5 hover:bg-[#8b4513]/20 dark:hover:bg-white/10 backdrop-blur-md border border-[#8b4513]/20 dark:border-white/10 text-[#8b4513] dark:text-[#d2b48c] px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn">
            Learn More <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#f8f5f2] dark:from-[#050505] to-transparent pointer-events-none transition-colors duration-500" />
    </section>
  );
};

export default Hero;