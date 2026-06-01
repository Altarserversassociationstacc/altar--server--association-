import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 border-b transition-colors duration-500 bg-[#050505]/90 backdrop-blur-md text-[#d2b48c] border-[#2a1b12] shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-16 w-auto items-center justify-center"> {/* Increased height for logo */}
              <img src={logo} alt="ASA Logo" className="w-full h-full " />
            </div>

          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 font-medium uppercase text-sm tracking-widest items-center">
          <Link to="/" className="transition-colors hover:text-white">Home</Link>
          <Link to="/about" className="transition-colors hover:text-white">About</Link>
          <Link to="/events" className="transition-colors hover:text-white">Events</Link>
          <Link to="/executives" className="transition-colors hover:text-white">Executives</Link>
          <Link to="/gallery" className="transition-colors hover:text-white">Gallery</Link>
          <Link to="/contact" className="transition-colors hover:text-white">Contact</Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-4">
          <a href="#announcements" className="relative text-[#d2b48c] text-xl">
            <FaBell />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#8b4513] rounded-full animate-ping"></span>
          </a>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl">
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full p-8 flex flex-col gap-6 text-center md:hidden animate-fadeIn border-b bg-[#111111]/95 backdrop-blur-xl border-[#2a1b12] shadow-2xl">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm">Home</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm">About</Link>
            <Link to="/events" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm">Events</Link>
            <Link to="/executives" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm">Executives</Link>
            <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm">Gallery</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-widest text-sm">Contact</Link>
            <Link to="/signup" className="btn btn-primary btn-lg mt-4 px-5">
                      Join Us
                    </Link>
            {/* <a href="#join" onClick={() => setIsMenuOpen(false)} className="bg-[#8b4513] text-white py-3 rounded-sm text-xs font-bold uppercase">JOIN US</a> */}
          </div>
        )}

        <div className="hidden md:flex items-center gap-6">
          <a href="#announcements" className="relative text-[#d2b48c] hover:text-white transition-colors text-xl">
            <FaBell />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#8b4513] rounded-full animate-ping"></span>
          </a>
          <Link to="/signup" className="bg-gradient-to-r from-[#8b4513] to-[#5c4033] text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:from-[#a0522d] hover:to-[#8b4513] shadow-md hover:shadow-[#8b4513]/25 hover:-translate-y-0.5 transition-all duration-300 inline-block">
            JOIN US
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
