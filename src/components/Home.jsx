import React from 'react';
import Hero from './Hero';
import AboutUs from './AboutUs';
import Events from './Events';
import Gallery from './Gallery';
import MemberPosts from './MemberPosts';
import JoinUs from './JoinUs';
import PublicAnnouncements from './PublicAnnouncements';
import ContactUs from './ContactUs';

const Home = () => {
  return (
    <main className="bg-[#f8f5f2] dark:bg-[#050505] transition-colors duration-500">
      <Hero />
      <AboutUs isFullPage={false} />
      <JoinUs />
      
      {/* Announcements placed right before the contact section */}
      <PublicAnnouncements />
      
      <ContactUs />
    </main>
  );
};

export default Home;