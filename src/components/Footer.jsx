import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaChurch, FaChevronRight,
  FaFacebookF, FaTwitter, FaInstagram 
} from 'react-icons/fa'; 
import logo from '../assets/logo.png';


const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-20 pb-10 border-t transition-colors duration-500 font-sans bg-[#050505] border-[#2a1b12] text-gray-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          
          {/* Branding Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-auto items-center justify-center"> {/* Increased height for logo */}
                <img src={logo} alt="ASA Logo" className="w-full h-full" />
              </div>
            </div>
            <p className="text-sm leading-relaxed italic">
              "Ad Majorem Dei Gloriam" — Promoting the culture of reverent service and spiritual growth at the Holy Altar.
            </p>
            <div className="flex gap-4 pt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#2a1b12] bg-[#111111] shadow-md flex items-center justify-center rounded-full hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all duration-300 text-lg hover:-translate-y-1" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#2a1b12] bg-[#111111] shadow-md flex items-center justify-center rounded-full hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all duration-300 text-lg hover:-translate-y-1" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#2a1b12] bg-[#111111] shadow-md flex items-center justify-center rounded-full hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all duration-300 text-lg hover:-translate-y-1" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] border-b pb-2 inline-block text-[#d2b48c] border-[#2a1b12]">
              Quick Links
            </h3>
            <ul className="space-y-4 text-xs uppercase tracking-widest font-medium">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Liturgical Events', path: '/events' },
                { name: 'Announcements', path: '/#announcements' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="flex items-center gap-2 hover:text-[#8b4513] transition-colors">
                    <FaChevronRight className="text-[8px] opacity-50" />
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a href="http://localhost:3001/admin/login" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <FaChevronRight className="text-[8px] opacity-50" />
                  Admin Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] border-b pb-2 inline-block text-[#d2b48c] border-[#2a1b12]">
              Get In Touch
            </h3>
            <div className="space-y-4 text-sm font-light">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="mt-1 text-[#8b4513]" />
                <p>Sanctuary Grounds,<br />St. Thomas Aquinas Catholic Chaplaincy (STACC), FUTO</p>
              </div>
              <div className="flex items-center gap-4">
                <FaEnvelope className="text-[#8b4513]" />
                <a href="mailto:altarserverassociation@gmail.com" className="hover:underline">altarserverassociation@gmail.com</a>
              </div>
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-[#8b4513]" />
                <p>+2347036224145</p>
                <p>+2348138957245</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t text-[10px] uppercase tracking-widest text-center space-y-4 border-[#2a1b12] mt-10">
          <p>
            © {currentYear} Altar Server Association • St. Thomas Aquinas Catholic Chaplaincy, FUTO. All rights reserved.
          </p>
          <p className="text-gray-500 font-medium">
            Developed by <span className="text-[#d2b48c]">Bro Egwuonwu Makuochukwu Vitalis</span> 
            <br className="md:hidden" /> 
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;