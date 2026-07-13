import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import logo from '../assets/des.png';
import { useTheme } from '../context/ThemeContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 border-b transition-colors duration-500 bg-[#f8f5f2]/90 dark:bg-[#050505]/90 backdrop-blur-md text-[#8b4513] dark:text-[#d2b48c] border-[#e6d5c3] dark:border-[#2a1b12] shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-16 w-auto items-center justify-center"> {/* Increased height for logo */}
              <img src={logo} alt="ASA Logo" className="w-full h-full object-contain transition-all" />
            </div>

          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 font-medium uppercase text-sm tracking-widest items-center">
          <Link to="/" className="transition-colors text-gray-800 hover:text-[#8b4513] dark:text-[#d2b48c] dark:hover:text-white">Home</Link>
          <Link to="/about" className="transition-colors text-gray-800 hover:text-[#8b4513] dark:text-[#d2b48c] dark:hover:text-white">About</Link>
          <Link to="/events" className="transition-colors text-gray-800 hover:text-[#8b4513] dark:text-[#d2b48c] dark:hover:text-white">Events</Link>
          <Link to="/executives" className="transition-colors text-gray-800 hover:text-[#8b4513] dark:text-[#d2b48c] dark:hover:text-white">Executives</Link>
          <Link to="/gallery" className="transition-colors text-gray-800 hover:text-[#8b4513] dark:text-[#d2b48c] dark:hover:text-white">Gallery</Link>
         <Link to="/levels" className="transition-colors text-gray-800 hover:text-[#8b4513] dark:text-[#d2b48c] dark:hover:text-white">Levels</Link>
          <Link to="/contact" className="transition-colors text-gray-800 hover:text-[#8b4513] dark:text-[#d2b48c] dark:hover:text-white">Contact</Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={toggleTheme} className="text-xl hover:opacity-80 transition-opacity" aria-label="Toggle Theme">
            {isDarkMode ? <FaSun className="text-[#d2b48c]" /> : <FaMoon className="text-[#8b4513]" />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl">
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full p-8 flex flex-col gap-6 text-center md:hidden animate-fadeIn border-b bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl border-[#e6d5c3] dark:border-[#2a1b12] shadow-2xl text-gray-900 dark:text-white">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm hover:text-[#8b4513]">Home</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm hover:text-[#8b4513]">About</Link>
            <Link to="/events" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm hover:text-[#8b4513]">Events</Link>
            <Link to="/executives" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm hover:text-[#8b4513]">Executives</Link>
            <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm hover:text-[#8b4513]">Gallery</Link>
           <Link to="/levels" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm hover:text-[#8b4513]">Levels</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm hover:text-[#8b4513]">Contact</Link>
            <Link to="/signup" className="bg-gradient-to-r from-[#8b4513] to-[#5c4033] text-white px-5 py-3 mt-4 rounded-lg font-bold uppercase tracking-widest shadow-md inline-block">
                      Join Us
                    </Link>
          </div>
        )}

        <div className="hidden md:flex items-center gap-6">
          <button onClick={toggleTheme} className="text-xl hover:opacity-80 transition-opacity" aria-label="Toggle Theme">
            {isDarkMode ? <FaSun className="text-[#d2b48c] hover:text-white" /> : <FaMoon className="text-[#8b4513] hover:text-gray-900" />}
          </button>
          <Link to="/signup" className="bg-gradient-to-r from-[#8b4513] to-[#5c4033] text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:from-[#a0522d] hover:to-[#8b4513] shadow-md hover:shadow-[#8b4513]/25 hover:-translate-y-0.5 transition-all duration-300 inline-block">
            JOIN US
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
