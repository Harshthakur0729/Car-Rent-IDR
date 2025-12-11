import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Database, Radio, Lock, Activity, Server, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const securityStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  @keyframes scanline {
    0% { top: -100%; }
    100% { top: 100%; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .animate-scan {
    animation: scanline 4s linear infinite;
  }
  .animate-spin-slow {
    animation: spin-slow 12s linear infinite;
  }
  .animate-blink {
    animation: blink 2s infinite;
  }

  .glass-panel {
    background: rgba(15, 15, 15, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
  }
  
  .hud-grid {
    background-image: linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px);
    background-size: 30px 30px;
  }

  .video-overlay-red {
    background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(20,0,0,0.95) 100%, #000);
  }

  /* FORCE HIDE VIDEO CONTROLS */
  video::-webkit-media-controls {
      display: none !important;
  }
  video {
      pointer-events: none; 
  }
`;

const Security = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const API = import.meta.env.VITE_BACKEND_URL;

  const [videoUrl, setVideoUrl] = useState(null);

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

  useEffect(() => {
    fetchVideoData();
    window.scrollTo(0, 0);
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-black overflow-x-hidden">
      <style>{securityStyles}</style>

      {/* HERO SECTION  */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 w-[100%] h-[100%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60">
            
            {/* DIRECT VIDEO ONLY */}
            {videoUrl && (
                <video
                    src={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover pointer-events-none"
                />
            )}

          </div>
          <div className="absolute inset-0 video-overlay-red pointer-events-none" />
          <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none"></div>
        </div>

        <div className="relative z-20 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-2 border border-red-500/40 bg-red-950/30 rounded-full mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-mono text-red-400 tracking-[0.3em]">SYSTEM ARMED</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-tight"
          >
            Uncompromised <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse">Security</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto"
          >
            Elite protection for elite journeys. Advanced telemetry, encrypted data vaults, and 24/7 global satellite monitoring.
          </motion.p>
        </div>
      </section>

      {/* FEATURES GRID  */}
      <section className="py-24 px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants} className="glass-panel p-10 rounded-3xl group hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2">
            <div className="w-14 h-14 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-500 text-red-500 group-hover:text-white">
              <Radio size={28} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase italic">Live Telemetry</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              Real-time GPS tracking with millisecond precision. We monitor vehicle health, speed, and location to ensure your safety anywhere on the globe.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants} className="glass-panel p-10 rounded-3xl group hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2">
            <div className="w-14 h-14 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-500 text-red-500 group-hover:text-white">
              <Lock size={28} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase italic">Ironclad Data</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              Your identity documents and trip data are stored in AES-256 encrypted vaults. Accessible only by you and our highest clearance officers.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="glass-panel p-10 rounded-3xl group hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2">
            <div className="w-14 h-14 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-500 text-red-500 group-hover:text-white">
              <Shield size={28} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase italic">Fleet Defense</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              Every vehicle undergoes a 150-point inspection before release. Equipped with run-flat technology and emergency SOS response systems.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* COMMAND CENTER VISUAL (HUD)  */}
      <section className="py-24 border-y border-white/5 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative z-10"
          >
            <h2 className="text-5xl font-black uppercase italic mb-8">Global <span className="text-red-600">Overwatch</span></h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-red-500"><Database /></div>
                <div>
                  <h4 className="text-white font-bold mb-1">Zero Latency</h4>
                  <p className="text-zinc-500 text-xs font-mono">Instant data transmission from vehicle sensors to our secure cloud.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-red-500"><Eye /></div>
                <div>
                  <h4 className="text-white font-bold mb-1">24/7 Surveillance</h4>
                  <p className="text-zinc-500 text-xs font-mono">Our dedicated security team monitors all active trips for anomalies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-red-500"><Server /></div>
                <div>
                  <h4 className="text-white font-bold mb-1">Redundant Backups</h4>
                  <p className="text-zinc-500 text-xs font-mono">Fail-safe servers ensure your trip data is never lost or compromised.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Digital HUD Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full"
          >
            <div className="relative w-full aspect-square md:aspect-video bg-black rounded-3xl border border-red-900/40 overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.1)]">
              {/* Grid Background */}
              <div className="absolute inset-0 hud-grid opacity-20"></div>

              {/* Scanning Bar */}
              <div className="absolute left-0 right-0 h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-scan z-10"></div>

              {/* Center Target */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-red-500/20 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 border border-red-500/40 rounded-full border-dashed animate-spin-slow"></div>
                <div className="absolute w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="absolute w-full h-full bg-gradient-to-t from-red-500/5 to-transparent rounded-full animate-pulse"></div>
              </div>

              {/* Floating Data Labels */}
              <div className="absolute top-6 left-6 font-mono text-[10px] text-red-500">
                <p>STATUS: <span className="text-white">ACTIVE</span></p>
                <p>Signal: <span className="text-white">STRONG</span></p>
              </div>

              <div className="absolute bottom-6 right-6 font-mono text-[10px] text-red-500 text-right">
                <p>ENCRYPTION: <span className="text-white">AES-256</span></p>
                <p>LATENCY: <span className="text-white">12ms</span></p>
              </div>

              {/* Blinking Alert Mockup */}
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-950/50 px-3 py-1 rounded border border-red-500/30 animate-blink">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-[10px] text-red-400 font-bold tracking-widest">LIVE</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* CTA  */}
      <section className="py-32 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none"></div>
        <h2 className="text-4xl font-black text-white mb-8 uppercase italic relative z-10">Secure Your Drive Today</h2>
        <Link
          to="/customers"
          className="relative z-10 px-12 py-5 bg-red-600 text-white font-bold text-sm tracking-[0.25em] hover:bg-white hover:text-red-600 transition-all duration-300 uppercase rounded-sm shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:shadow-[0_0_60px_rgba(220,38,38,0.6)]"
        >
          Explore The Fleet
        </Link>
      </section>

      {/* SCROLL TO TOP  */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-4 bg-red-600 text-white rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:bg-white hover:text-red-600 transition-all duration-500 transform hover:-translate-y-1 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

    </div>
  );
};

export default Security;