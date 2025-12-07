import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, MapPin } from 'lucide-react';
import axios from 'axios';

const aboutStyles = `
  /* HIDE SCROLLBAR BUT KEEP SCROLLING */
  html, body {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  ::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes gridMove {
    0% { background-position: 0 0; }
    100% { background-position: 0 40px; }
  }

  .animate-fade-up {
    animation: fadeInUp 1s ease-out forwards;
    opacity: 0;
  }
  .animate-slide-left {
    animation: slideInLeft 1s ease-out forwards;
    opacity: 0;
  }
  .delay-200 { animation-delay: 0.2s; }
  .delay-400 { animation-delay: 0.4s; }
  
  /* Subtle text gradient */
  .text-gradient {
    background: linear-gradient(135deg, #fff 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  /* Glass card effect */
  .glass-card {
    background: rgba(24, 24, 27, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .bg-grid-move {
    background-image: linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 3s linear infinite;
    }
    
    /* Video Overlay Gradient */
    .video-overlay {
      background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8) 80%, #000);
  }
  `;

const About = () => {
  const API = import.meta.env.VITE_BACKEND_URL;
  const [data, setData] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);

  const dataget = async () => {
    try {
      const res = await axios.get(`${API}/dynamic/get/dynamic/data`);
      setData(res.data.data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchVideoData = async () => {
    try {
      const res = await axios.get(`${API}/dynamic/get/video`);
      if (res.data?.data?.length > 0) {
        setVideoUrl(res.data.data[0].main);
      }
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  useEffect(() => { dataget(); fetchVideoData(); }, [])
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      <style>{aboutStyles}</style>

      {/*  HERO SECTION WITH VIDEO BACKGROUND  */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">

        {/* Video Background Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {/* Using YouTube Embed URL for background video */}
            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title="About Background"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            ></iframe>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 video-overlay pointer-events-none" />

          {/* Animated Grid Overlay */}
          <div className="absolute inset-0 bg-grid-move z-10 pointer-events-none" style={{ perspective: '500px', transform: 'rotateX(20deg) scale(1.5)' }}></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <span className="text-cyan-400 tracking-[0.3em] text-xs font-bold uppercase mb-4 block animate-fade-up">Our Legacy</span>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 animate-fade-up delay-200">
            DRIVEN BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">PASSION</span>
          </h1>
        </div>
      </section>

      {/*  THE STORY SECTION  */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <div className="animate-slide-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              More Than Just <br /> <span className="text-cyan-500 italic">Transportation.</span>
            </h2>
            <div className="w-20 h-1 bg-cyan-500 mb-8"></div>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-light">
              {data.aboutSummary}
            </p>

          </div>

          {/* Image Collage */}
          <div className="relative h-[500px] w-full hidden lg:block animate-fade-up delay-200">
            <div className="absolute top-0 right-0 w-3/4 h-3/4 border-2 border-zinc-800 rounded-2xl overflow-hidden z-10 hover:border-cyan-500 transition-colors duration-500">
              <img src={data.aboutImg1} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" alt="Luxury Interior" />
            </div>
            <div className="absolute bottom-0 left-0 w-2/3 h-2/3 border-2 border-zinc-800 bg-black rounded-2xl overflow-hidden z-20 shadow-2xl hover:border-cyan-500 transition-colors duration-500">
              <img src={data.aboutImg2} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" alt="Steering Wheel" />
            </div>
          </div>

        </div>
      </section>

      {/*  VALUES STRIP (UPDATED)  */}
      <section className="py-20 bg-zinc-950 border-y border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

          {/* Value 1: RENTAL AGREEMENT */}
          <div className="glass-card p-8 rounded-2xl hover:bg-zinc-900 transition-all duration-300 group cursor-pointer">
            <div className="mb-4 p-3 bg-cyan-950/30 rounded-lg w-fit border border-cyan-900 group-hover:border-cyan-500 transition-colors text-cyan-400">
              <FileText size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-wider">Rental Agreement</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Transparent, digital, and secure. Our agreements are designed for speed and clarity, getting you on the road faster.
            </p>
          </div>

          {/* Value 2: INSURANCE POLICY */}
          <div className="glass-card p-8 rounded-2xl hover:bg-zinc-900 transition-all duration-300 group cursor-pointer">
            <div className="mb-4 p-3 bg-cyan-950/30 rounded-lg w-fit border border-cyan-900 group-hover:border-cyan-500 transition-colors text-cyan-400">
              <Shield size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-wider">Policy</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Comprehensive coverage tailored for high-performance vehicles. Drive with confidence knowing you are fully protected.
            </p>
          </div>

          {/* Value 3: LOCATIONS */}
          <div className="glass-card p-8 rounded-2xl hover:bg-zinc-900 transition-all duration-300 group cursor-pointer">
            <div className="mb-4 p-3 bg-cyan-950/30 rounded-lg w-fit border border-cyan-900 group-hover:border-cyan-500 transition-colors text-cyan-400">
              <MapPin size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-wider">Locations</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              From city centers to private airports, our premium hubs are strategically located for your ultimate convenience.
            </p>
          </div>

        </div>
      </section>

      {/*  TEAM SECTION  */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center relative z-10">
        <span className="text-cyan-500 font-mono text-xs tracking-widest uppercase mb-2 block">The Architects</span>
        <h2 className="text-4xl font-black text-white mb-16 uppercase italic">Meet The <span className="text-zinc-600">Crew</span></h2>

        {(() => {
          const team = data.aboutProfile || [];
          const count = team.length;

          let containerClass = "grid gap-10";
          if (count === 1) {
            containerClass = "flex justify-center flex-wrap gap-10";
          } else {
            containerClass = "grid grid-cols-1 md:grid-cols-3 gap-10";
          }

          return (
            <div className={containerClass}>
              {count > 0 ? (
                team.map((member, index) => {

                  let itemClass = "group w-full";

                  if (count === 2) {
                    if (index === 0) itemClass += " md:col-start-1";
                    if (index === 1) itemClass += " md:col-start-3";
                  }

                  // Agar 1 banda hai to width thodi control karte hai taki fail na jaye
                  if (count === 1) {
                    itemClass += " max-w-xs";
                  }

                  return (
                    <div key={member._id} className={itemClass}>
                      <div className="relative w-48 h-48 mx-auto mb-6 rounded-full p-1 bg-gradient-to-br from-zinc-700 to-black group-hover:from-cyan-500 group-hover:to-blue-600 transition-all duration-500">
                        <img
                          src={member.img}
                          alt={member.name}
                          className="w-full h-full object-cover rounded-full border-4 border-black grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wide">{member.name}</h3>
                      <p className="text-cyan-500 text-xs font-mono mt-1 tracking-widest">{member.profession}</p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-zinc-500 italic">
                  Loading team members...
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/*  CTA SECTION  */}
      <section className="py-20 bg-gradient-to-r from-black via-zinc-900 to-black border-t border-zinc-900 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 italic">READY TO TAKE THE WHEEL?</h2>
        <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
          The car of your dreams is waiting in our garage. Don't just watch the road—dominate it.
        </p>
        <Link
          to="/customers"
          className="inline-block px-10 py-4 bg-white text-black font-bold text-sm tracking-[0.2em] hover:bg-cyan-400 transition-colors duration-300 uppercase skew-x-[-10deg]"
        >
          <span className="block skew-x-[10deg]">Browse The Fleet</span>
        </Link>
      </section>

      {/*  SCROLL TO TOP BUTTON  */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-4 bg-cyan-600 text-black rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:bg-white transition-all duration-500 transform hover:-translate-y-1 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="Scroll to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

    </div>
  );
};

export default About;