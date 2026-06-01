import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import { FaUsers, FaArrowRight } from 'react-icons/fa';
import heroBg from '../assets/image.png';

// Use environment variable for the API base to simplify deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ExecutiveSection = () => {
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize session calculation to prevent unnecessary logic runs on re-render
  const currentSession = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() >= 7 
      ? `${year}/${year + 1}` 
      : `${year - 1}/${year}`;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchTeaser = async () => {
      try {
        setLoading(true);
        const encodedSession = encodeURIComponent(currentSession);
        
        const res = await axios.get(
          `${API_BASE_URL}/api/executives/group-photo?year=${encodedSession}`,
          { signal: abortController.signal }
        );
        
        if (isMounted && res.data?.success) {
          setGroupPhoto(res.data.data);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.warn("Notice: No active session photo found for", currentSession);
          setGroupPhoto(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchTeaser();

    return () => {
      isMounted = false;
      abortController.abort(); // Cleanup network request if user navigates away
    };
  }, [currentSession]);

  return (
    <section className="relative py-32 bg-[#050505] px-6 border-t border-[#2a1b12] overflow-hidden group/hero">
      {/* Professional Hero Background with subtle zoom effect */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center bg-no-repeat pointer-events-none transition-transform duration-1000 group-hover/hero:scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Layered Overlays for Cinematic Depth & Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] pointer-events-none" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        
        {/* Header Section */}
        <header className="mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#8b4513]/30 bg-[#8b4513]/5 mb-4">
            <p className="text-[#8b4513] text-[10px] uppercase tracking-[0.3em] font-black">
              Current Administration
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#d2b48c] tracking-tighter">
            Meet the Executives
          </h2>
          <p className="text-[#8b4513] text-xs font-bold uppercase tracking-[0.4em] opacity-80">
            Academic Session {currentSession}
          </p>
          {groupPhoto?.executiveName && (
            <h3 className="text-[#d2b48c] text-xl md:text-2xl font-serif italic pt-2 animate-fadeIn">
              {groupPhoto.executiveName}
            </h3>
          )}
        </header>

        {/* Content Area */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <PulseLoader color="#8b4513" size={8} />
              <p className="text-gray-600 text-[10px] uppercase tracking-widest">Retrieving Council Data</p>
            </div>
          ) : groupPhoto ? (
            <Link 
              to="/executives" 
              className="group relative block w-full max-w-5xl rounded-[2rem] overflow-hidden border border-[#2a1b12] shadow-2xl transition-all duration-700 hover:border-[#8b4513]/50"
            >
              <img 
                src={groupPhoto.imageUrl} 
                alt={`Executive Council Portrait`}
                className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-1000"
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute bottom-8 inset-x-0 flex flex-col items-center px-6">
                 <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-[#8b4513]/20 transition-all group-hover:bg-[#8b4513]/10">
                    <FaUsers className="text-[#8b4513] text-lg" />
                    <div className="text-left">
                      <p className="text-[#d2b48c] font-black uppercase text-[10px] tracking-widest leading-none">
                        View Executive Directory
                      </p>
                      <p className="text-gray-500 text-[9px] uppercase mt-1">
                        Session {groupPhoto.sessionYear}
                      </p>
                    </div>
                    <FaArrowRight className="text-[#8b4513] ml-2 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </Link>
          ) : (
            /* Professional Empty State */
            <div className="w-full max-w-4xl py-20 px-8 rounded-[2rem] bg-[#0a0a0a] border border-dashed border-[#2a1b12] flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#2a1b12] flex items-center justify-center text-[#8b4513] mb-6">
                <FaUsers size={28} className="opacity-50" />
              </div>
              <h4 className="text-2xl font-serif text-[#d2b48c] mb-3">Cabinet Archives Pending</h4>
              <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-8">
                The official portrait for the {currentSession} session is being processed. 
                In the meantime, you may explore our historical leadership database.
              </p>
              <Link 
                to="/executives" 
                className="flex items-center gap-3 bg-[#111111] hover:bg-[#1a110b] border border-[#2a1b12] hover:border-[#8b4513] text-[#d2b48c] px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Access Archives <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSection;