import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaChevronRight, FaSync, FaTimesCircle, FaRegCalendarTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const Events = ({ isFullPage = false }) => {
  // State Matrix
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const categories = ["All Events", "Workshops", "Seminars", "Liturgical Competitions", "Fellowship", "Meetings"];

  // 1. Core Data Synchronization Engine
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5001/api/events');
        
        // Normalize today's date boundary once per fetch execution cycle
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        // Filter out expired items and map incoming data metrics automatically
        const upcomingEvents = res.data.filter(event => {
          const eventDay = new Date(event.eventDate);
          eventDay.setHours(0, 0, 0, 0);
          return eventDay >= today;
        });

        // Sort chronologically ascending (Closest upcoming date pops out first)
        upcomingEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        setEvents(upcomingEvents);
      } catch (err) {
        console.error("❌ [API Data Sync Failure]:", err);
      } finally {
        // Smooth UI rendering buffer window
        setTimeout(() => setLoading(false), 1000);
      }
    };
    
    fetchEvents();
  }, []);

  // 2. Asset Link Transformer (Cloudinary vs Local System Router)
  const getImageUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:5001/${path}`;
  };

  // 3. High-Performance Filter Processor Layer
  // Pre-computing date inputs outside the loop iteration loop avoids UI blocking
  const startFilterDate = startDate ? new Date(startDate) : null;
  if (startFilterDate) startFilterDate.setHours(0, 0, 0, 0);

  const endFilterDate = endDate ? new Date(endDate) : null;
  if (endFilterDate) endFilterDate.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter(event => {
    // Structural Category Evaluation
    const categoryMatch = activeCategory === "All Events" || event.category === activeCategory;

    // Normalizing loop document variables
    const eventDate = new Date(event.eventDate);
    eventDate.setHours(0, 0, 0, 0);

    // Structural Date Window Evaluation Match
    const dateMatch = (!startFilterDate || eventDate >= startFilterDate) && 
                      (!endFilterDate || eventDate <= endFilterDate);

    return categoryMatch && dateMatch;
  });

  // 4. View Mode Decoupler Routing Rules
  const displayEvents = isFullPage
    ? filteredEvents
    : filteredEvents
        .slice(0, 3); // Restricts grid sprawl to a clean row of 3 on Homepage view

  return (
    <section id="events" className="py-16 bg-[#050505] text-white px-6 font-sans relative overflow-hidden transition-all duration-500 selection:bg-[#8b4513]/30 selection:text-[#d2b48c]">
      {/* Cinematic Studio Glow Element */}
      <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-[#8b4513] rounded-full blur-[180px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Module Title Section */}
        <div className="max-w-2xl text-center mx-auto space-y-3">
          <h2 className="text-3xl md:text-5xl font-serif text-[#8b4513] uppercase tracking-wider">Events & Activities</h2>
          <p className="text-[#d2b48c]/80 text-xs md:text-sm leading-relaxed tracking-wide max-w-xl mx-auto">
            Join us for interactive workshops, liturgical development tracks, spiritual seminars, and community fellowship structures.
          </p>
        </div>

        {/* Categories Control Ribbon */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${
                activeCategory === cat 
                  ? 'border-[#8b4513] bg-[#1a110b] text-white shadow-[0_0_20px_rgba(139,69,19,0.25)]' 
                  : 'border-[#2a1b12] bg-[#111111]/70 text-[#d2b48c] hover:border-[#8b4513]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeline Range Controller (Exclusive to Independent Page Framework) */}
        {isFullPage && (
          <div className="flex flex-wrap items-center justify-center gap-6 bg-[#111111]/40 border border-[#2a1b12] p-4 rounded-2xl max-w-3xl mx-auto animate-fadeIn">
            <div className="flex items-center gap-3">
              <label htmlFor="startDate" className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Bounds From:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#0c0c0c] border border-[#2a1b12] rounded-xl px-4 py-2 text-xs text-[#d2b48c] focus:border-[#8b4513] outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="endDate" className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Bounds To:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#0c0c0c] border border-[#2a1b12] rounded-xl px-4 py-2 text-xs text-[#d2b48c] focus:border-[#8b4513] outline-none transition-colors"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-950/30 transition-all"
              >
                <FaTimesCircle /> Flush Filters
              </button>
            )}
          </div>
        )}

        {/* Live Presentation Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            /* System Synchronization Display Layer */
            <div className="col-span-full flex flex-col items-center justify-center py-28 bg-[#111111]/20 rounded-[32px] border border-dashed border-[#2a1b12]">
              <ClipLoader color="#8b4513" size={40} speedMultiplier={0.7} />
              <p className="mt-5 text-[#d2b48c] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
                <FaSync className="animate-spin text-[9px] text-[#8b4513]" /> Syncing Devotional Activities
              </p>
            </div>
          ) : displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <div 
                key={event._id} 
                className="flex flex-col bg-[#111111]/80 backdrop-blur-md border border-[#2a1b12] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 hover:border-[#8b4513]/40 group hover:-translate-y-1"
              >
                {/* Media Flyer Asset Frame */}
                <div className="aspect-square bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden border-b border-[#2a1b12]/60">
                  <div className="absolute inset-0 bg-[#8b4513]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img 
                    src={getImageUrl(event.image)} 
                    alt={event.title} 
                    className="relative z-10 max-w-full max-h-full object-contain shadow-2xl rounded-xl transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>

                {/* Information Content Cluster */}
                <div className="p-7 flex flex-col flex-1 justify-between space-y-6">
                  <div className="space-y-6">
                    {/* Verticalized Detail Registry */}
                    <div className="space-y-4 border-l-2 border-[#8b4513]/20 pl-5 ml-1 py-1">
                      <div className="inline-block bg-[#8b4513]/10 text-[#d2b48c] border border-[#8b4513]/20 px-3 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest">
                        {event.category}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          <FaCalendarAlt className="text-[#8b4513] shrink-0" size={11} />
                          <span className="text-gray-300">
                            {new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          <FaClock className="text-[#8b4513] shrink-0" size={11} />
                          <span className="text-gray-300">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          <FaMapMarkerAlt className="text-[#8b4513] shrink-0" size={11} />
                          <span className="text-gray-300 truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-serif text-white tracking-widest group-hover:text-[#d2b48c] transition-colors duration-300 leading-tight uppercase">
                      {event.title}
                    </h3>

                    {/* Narrative Briefing */}
                    <div className="bg-[#0c0c0c] rounded-2xl p-4 border border-[#2a1b12] min-h-[80px] flex items-start">
                      <p className="text-gray-400 text-xs leading-relaxed italic line-clamp-4">
                        "{event.narration || "No supplementary briefing attached to this session framework profile."}"
                      </p>
                    </div>
                  </div>

                  {/* Operational Entry Action Call */}
                  <Link 
                    to="/signup" 
                    className="w-full text-center bg-gradient-to-r from-[#8b4513] to-[#5c4033] text-white font-bold py-3 px-4 rounded-xl text-[9px] uppercase tracking-[0.25em] shadow-xl hover:shadow-[#8b4513]/10 transform transition-all duration-300 hover:brightness-110"
                  >
                    Register for Event
                  </Link>
                </div>
              </div>
            ))
          ) : (
            /* Void Result Dataset Flag */
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#111111]/30 rounded-2xl border border-dashed border-[#2a1b12] max-w-xl mx-auto px-6 text-center">
              <FaRegCalendarTimes size={28} className="text-[#8b4513]/60 mb-3" />
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">No operational sequences fall within this filtering view.</p>
            </div>
          )}
        </div>

        {/* Global Catalog Navigation Bridge (Hidden if isFullPage is triggered) */}
        {!isFullPage && events.length > 3 && (
          <div className="text-center pt-6">
            <Link 
              to="/events" 
              className="inline-flex items-center gap-3 bg-transparent border border-[#2a1b12] hover:border-[#8b4513] hover:bg-[#111111] text-[#d2b48c] px-10 py-4 rounded-xl uppercase tracking-widest text-[10px] font-bold transition-all duration-300 shadow-xl hover:-translate-y-0.5 group"
            >
              View All Upcoming Activities 
              <FaChevronRight size={9} className="text-[#8b4513] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* Anchored Annual Signature Overviews */}
        {isFullPage && (
          <div className="pt-24 border-t border-[#1a110d] space-y-12">
            <h3 className="text-center text-2xl font-serif text-[#8b4513] uppercase tracking-[0.25em]">Annual Signature Schedules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "ASA Week", desc: "A full week of orientation routines, athletic championships, devotional synchronization, and organizational fellowship meets held across the open term." },
                { title: "ASA Liturgical Summit", desc: "A singular day summit addressing historical rubrics, operational protocols, and ecclesiastical development pipelines featuring guest interactions from the council clergy." },
                { title: "Sanctuary Awards Gala", desc: "Our annual evening celebration acknowledging standout service records, leadership achievements, and community support milestones over the preceding framework year." }
              ].map((sig, dynamicIndex) => (
                <div key={dynamicIndex} className="text-center p-6 bg-[#111111]/20 border border-[#2a1b12]/40 rounded-2xl transition-colors hover:border-[#8b4513]/20">
                  <h4 className="font-serif text-lg text-[#d2b48c] mb-4 tracking-wide">{sig.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto font-normal">{sig.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Events;