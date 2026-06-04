import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = ({ isFullPage = false }) => {
  if (!isFullPage) {
    return (
      <section id="about" className="py-24 bg-[#f8f5f2] dark:bg-[#050505] text-gray-900 dark:text-white px-6 font-sans relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b4513] rounded-full blur-[150px] opacity-5 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-[#8b4513] mb-8">Welcome to ASA</h2>
          <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              The Altar Server Association (ASA) is the official ministerial body for the Sanctuary at 
              St. Thomas Aquinas Catholic Chaplaincy (STACC), FUTO. We unite dedicated servers 
              from across the university under one collaborative community of faith.
            </p>
            <p>
              Our mission is to foster excellence in liturgical service, provide spiritual development 
              opportunities, and create a supportive brotherhood and sisterhood that empowers members 
              to achieve their full potential in the sacred service of the Holy Altar.
            </p>
            <p className="text-[#8b4513] dark:text-[#d2b48c] italic font-serif">
              Together, we build discipline, share spiritual knowledge, and shape the future of our liturgical ministry.
            </p>
          </div>
          <div className="mt-12">
            <Link 
              to="/about" 
              className="inline-block bg-transparent border border-[#d2b48c] dark:border-[#3d2b1f] hover:border-[#8b4513] dark:hover:border-[#8b4513] hover:bg-[#f0ece9] dark:hover:bg-[#1a110b] text-[#8b4513] dark:text-[#d2b48c] px-8 py-4 rounded-lg uppercase tracking-widest text-xs font-bold transition-all duration-300 shadow-lg hover:-translate-y-0.5"
            >
              Our Full Story
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-24 bg-[#f8f5f2] dark:bg-[#050505] text-gray-900 dark:text-white px-6 font-sans min-h-screen relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-40 left-10 w-96 h-96 bg-[#8b4513] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Introduction */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif text-[#8b4513] mb-6">About ASA</h2>
          <p className="text-[#8b4513] dark:text-[#d2b48c] text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed italic">
            "Empowering the next generation of liturgical ministers through community, spiritual formation, and holy innovation."
          </p>
        </div>

        {/* Our Story Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-6 text-gray-700 dark:text-gray-400 leading-relaxed text-lg">
            <h3 className="text-3xl font-serif text-[#8b4513] dark:text-[#d2b48c] border-b border-[#d2b48c] dark:border-[#3d2b1f] pb-2 inline-block">Our Story</h3>
            <p>
              Founded in 2021, the Altar Server Association (ASA) is the official guild representing all dedicated servers at the Federal University of Technology, Owerri (FUTO). As the recognized ministerial body for the Sanctuary of St. Thomas Aquinas Catholic Chaplaincy (STACC), we serve as the vital bridge between the servers, the clergy, and the chaplaincy administration.
            </p>
            <p>
              ASA was established to provide a unified voice for servers across all departments of the university. We work closely with the Chaplaincy team to address server concerns, refine liturgical rubrics, and enhance the overall worship experience within the sacred Sanctuary.
            </p>
            <p>
              Beyond the Altar, ASA plays a vital role in campus life by organizing retreats, liturgical workshops, and social activities that foster unity among servers. We maintain strong relationships with the Chaplaincy Council and other pious societies, working together to create a vibrant and supportive faith community.
            </p>
          </div>
          <div className="bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md p-10 border border-[#e6d5c3] dark:border-[#2a1b12] rounded-xl shadow-2xl relative overflow-hidden group hover:border-[#d2b48c] dark:hover:border-[#3d2b1f] transition-all duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#8b4513] font-serif text-9xl select-none group-hover:opacity-20 transition-opacity">†</div>
            <div className="relative z-10 space-y-8">
              <div>
                <h4 className="text-[#8b4513] font-bold uppercase tracking-widest text-xs mb-3">Our Mission</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm italic">"To foster excellence in liturgical service by providing servers with opportunities for spiritual development, ritual engagement, and collaborative prayer. We aim to build a supportive community that empowers every member to reach their full potential as leaders in faith."</p>
              </div>
              <div>
                <h4 className="text-[#8b4513] font-bold uppercase tracking-widest text-xs mb-3">Our Vision</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm italic">"To be the leading liturgical guild, recognized for producing reverent, ethical, and skilled servers who drive positive change in the Church and society."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-32">
          <h3 className="text-3xl font-serif text-center text-[#d2b48c] mb-12 uppercase tracking-[0.3em]">Core Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Reverence", desc: "Fostering creative devotion and embracing traditional rubrics to serve the Real Presence." },
              { title: "Fraternity", desc: "Building a supportive guild where members learn from and support each other in faith." },
              { title: "Excellence", desc: "Striving for the highest standards in liturgical education and personal discipline." },
              { title: "Formation", desc: "Promoting lifelong spiritual learning and staying current with the traditions of the Mother Church." }
            ].map((value, i) => (
              <div key={i} className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-sm p-8 border border-[#e6d5c3] dark:border-[#2a1b12] rounded-xl shadow-xl hover:border-[#d2b48c] dark:hover:border-[#3d2b1f] hover:-translate-y-1 transition-all duration-300">
                <h4 className="text-[#8b4513] font-serif text-xl mb-3">{value.title}</h4>
                <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md border border-[#e6d5c3] dark:border-[#2a1b12] p-10 rounded-xl shadow-2xl relative">
          <h3 className="text-2xl font-serif text-center mb-16 tracking-widest uppercase text-[#8b4513]">Guild Objectives</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { 
                title: "Liturgical Mastery", 
                desc: "Provide workshops and training sessions to enhance the ceremonial and spiritual skills of members." 
              },
              { 
                title: "Ecclesiastical Engagement", 
                desc: "Build strong partnerships with the clergy and religious orders to create vocational opportunities for members." 
              },
              { 
                title: "Theological Knowledge", 
                desc: "Organize spiritual talks, seminars, and conferences featuring liturgical experts and thought leaders." 
              },
              { 
                title: "Ceremonial Precision", 
                desc: "Host liturgical quizzes and innovation challenges to foster creative problem-solving within church rubrics." 
              },
              { 
                title: "Guild Building", 
                desc: "Create a supportive network where members can collaborate, mentor each other, and build lasting spiritual bonds." 
              }
            ].map((obj, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-[#8b4513] font-serif text-2xl opacity-50">0{i+1}</div>
                <div>
                  <h4 className="text-[#8b4513] dark:text-[#d2b48c] font-bold text-xs uppercase tracking-tighter mb-2">{obj.title}</h4>
                  <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed">{obj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;