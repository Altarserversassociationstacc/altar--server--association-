import React from 'react';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import PublicAnnouncements from '../components/PublicAnnouncements';
import JoinUs from '../components/JoinUs';
import ExecutiveSection from '../components/ExecutiveSection';

const Home = () => {
  return (
    <>
      <Hero />
      <AboutUs isFullPage={false} />
      {/* Visual Teaser for Leadership */}
      <ExecutiveSection />
      <PublicAnnouncements />
      <JoinUs />
    </>
  );
};

export default Home;