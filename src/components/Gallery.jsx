import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { FaSync, FaTimes, FaDownload, FaExclamationTriangle, FaInbox } from 'react-icons/fa';

// Automatically sanitizes environmental variable strings to avoid trailing double slashes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const Gallery = ({ isFullPage = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memories, setMemories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(isFullPage ? 21 : 14);

  // Fetch archives from backend proxy
  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/gallery`);
      setMemories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch gallery archives:", err);
      setError(err.message || "An error occurred while loading the archives.");
    } finally {
      // Maintains your deliberate interactive loading animation sequence
      setTimeout(() => setLoading(false), 1500);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Dynamic utility to securely map images locally or via production Cloudinary/S3 assets
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  // Cross-Origin safe blob download client engine
  const handleDownload = async (imageUrl, title) => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Network status evaluation failed.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.trim().replace(/\s+/g, '_') || 'sacred_memory'}.jpg`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Client side resource download block:", err);
      // Fallback fallback mechanism: Opens the raw source directory image asset if proxy stream breaks
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <section className={`py-16 bg-[#f8f5f2] dark:bg-[#0a0a0a] text-gray-900 dark:text-white px-6 font-sans transition-colors duration-500 ${isFullPage ? 'min-h-screen pt-24' : ''}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block Section */}
        <div className={`text-center ${isFullPage ? 'mb-20' : 'mb-12'}`}>
          <h2 className="text-4xl md:text-5xl font-serif text-[#8b4513] mb-4">Gallery Archives</h2>
          <div className="h-1 w-20 bg-[#8b4513] mx-auto mb-6"></div>
          <p className="text-[#8b4513] dark:text-[#d2b48c] text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Memories from our sacred events and activities. Captured moments of our service at the Holy Altar and our fraternal life.
          </p>
        </div>

        {/* Core Display & Conditionals Layout Routing */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 min-h-[400px] relative">
          
          {/* State A: Loading UI View */}
          {loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <ClipLoader color="#8b4513" size={60} />
              <p className="mt-6 text-[#8b4513] dark:text-[#d2b48c] text-[10px] uppercase tracking-[0.5em] font-bold flex items-center gap-3">
                <FaSync className="animate-spin text-[12px]" /> Opening the Archives
              </p>
            </div>
          )}

          {/* State B: Error Resolution View */}
          {!loading && error && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
              <FaExclamationTriangle className="text-amber-700 dark:text-[#d2b48c] text-3xl mb-4" />
              <p className="text-[#8b4513] dark:text-[#d2b48c] font-serif text-lg">The archives could not be reached.</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-md">{error}</p>
              <button 
                onClick={fetchGallery}
                className="mt-6 border border-[#8b4513] text-[#8b4513] dark:border-[#d2b48c] dark:text-[#d2b48c] px-5 py-2 rounded text-xs uppercase tracking-wider font-bold hover:bg-[#8b4513] hover:text-white dark:hover:bg-[#d2b48c] dark:hover:text-black transition-all"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* State C: Empty Repository View */}
          {!loading && !error && memories.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
              <FaInbox className="text-gray-300 dark:text-gray-700 size-10 mb-3" />
              <p className="text-[#8b4513] dark:text-[#d2b48c] font-serif text-lg">Silent Sacristy</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">No captured memories have been logged into this ledger yet.</p>
            </div>
          )}

          {/* State D: Success Component Mapping Grid */}
          {!loading && !error && memories.length > 0 && (
            memories.slice(0, visibleCount).map((item) => (
              <div 
                key={item._id || item.id} 
                className="group relative overflow-hidden border border-[#e6d5c3] dark:border-[#3d2b1f] aspect-square rounded-full bg-gray-200 dark:bg-[#1a1a1a] cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-10"
                onClick={() => setSelectedImage(item)}
              >
                {/* Media Node */}
                <img 
                  src={getImageUrl(item.imageUrl)} 
                  alt={item.title || "Sacred Memory"}
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 rounded-full"
                  loading="lazy"
                />
                
                {/* Micro Metadata Dynamic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-black via-white/50 dark:via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-center p-4 rounded-full">
                  <span className="text-[#8b4513] text-[8px] font-bold uppercase tracking-widest mb-1">
                    {item.category || "Moment"}
                  </span>
                  <h3 className="text-[10px] md:text-xs font-serif text-gray-900 dark:text-white px-1 leading-tight">
                    {item.title || "Untitled Memory"}
                  </h3>
                </div>

                {/* Aesthetic Inline Frame Accents */}
                <div className="absolute inset-4 border border-[#8b4513]/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Pagination Control Node */}
        {!loading && !error && visibleCount < (isFullPage ? memories.length : Math.min(memories.length, 49)) && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 14)}
              className="inline-block bg-transparent border border-[#d2b48c] dark:border-[#3d2b1f] hover:border-[#8b4513] hover:bg-white dark:hover:bg-[#1a110b] text-[#8b4513] dark:text-[#d2b48c] px-8 py-3 rounded-lg uppercase tracking-widest text-[10px] font-bold transition-all duration-300 shadow-lg hover:-translate-y-0.5"
            >
              Load More Moments
            </button>
          </div>
        )}

        {/* Fullscreen Interactive Lightbox Modal Overlay */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 transition-opacity duration-300"
            onClick={() => setSelectedImage(null)}
          >
            {/* Control Bar Actions Layout */}
            <div className="absolute top-6 right-6 flex gap-4">
              <button 
                className="text-[#8b4513] dark:text-[#d2b48c] hover:text-gray-900 dark:hover:text-white transition-colors p-2 bg-gray-100 dark:bg-[#1a110b] rounded-full border border-[#e6d5c3] dark:border-[#3d2b1f] z-10 shadow-sm"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleDownload(getImageUrl(selectedImage.imageUrl), selectedImage.title); 
                }}
                title="Download Memory Asset"
              >
                <FaDownload size={20} />
              </button>
              <button 
                className="text-[#8b4513] dark:text-[#d2b48c] hover:text-gray-900 dark:hover:text-white transition-colors p-2 bg-gray-100 dark:bg-[#1a110b] rounded-full border border-[#e6d5c3] dark:border-[#3d2b1f] z-10 shadow-sm"
                onClick={() => setSelectedImage(null)}
                title="Close Lighbox"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            {/* Focused Frame Wrapper */}
            <div 
              className="max-w-5xl w-full flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={getImageUrl(selectedImage.imageUrl)} 
                alt={selectedImage.title || "Expanded Memory View"} 
                className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-lg border border-[#e6d5c3]/30 dark:border-[#3d2b1f]"
              />
              <div className="text-center px-4 max-w-2xl">
                <span className="text-[#8b4513] text-xs font-bold uppercase tracking-[0.3em] mb-2 block">
                  {selectedImage.category || 'General Collection'}
                </span>
                <h3 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white tracking-tight leading-tight">
                  {selectedImage.title || "Untitled Sacred Event"}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Global Standalone Route Fallback Footer Redirect */}
        {!isFullPage && !loading && !error && memories.length > 49 && (
          <div className="mt-16 text-center">
            <Link to="/gallery" className="inline-block bg-transparent border border-[#d2b48c] dark:border-[#3d2b1f] hover:border-[#8b4513] hover:bg-white dark:hover:bg-[#1a110b] text-[#8b4513] dark:text-[#d2b48c] px-8 py-3 rounded-lg uppercase tracking-widest text-[10px] font-bold transition-all duration-300">
              View Full Gallery
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;