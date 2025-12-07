import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Shield, FileText } from 'lucide-react';
import axios from 'axios';

const Footer = ({ data }) => {

  const footerData = data?.data || data || {};

  const WhatsAppIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );

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

  useEffect(() => { fetchVideoData(); }, []);

  const getVideoID = (url) => {
    if (!url) return "";
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : "";
    } catch (e) {
      return "";
    }
  };

  return (
    <footer className="relative bg-black text-white font-sans overflow-hidden border-t border-zinc-900">

      <div className="relative w-full h-48 md:h-64 overflow-hidden border-b border-zinc-800 group">

        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none group-hover:bg-black/20 transition-all duration-700"></div>

        {/* Video Player */}
        {videoUrl ? (
          // CASE 1: Direct File (Cloudinary/MP4/WebM)
          videoUrl.includes("cloudinary") || videoUrl.match(/\.(mp4|webm|mov)$/) ? (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute left-1/4 w-[50%] h-full object-cover scale-105 pointer-events-none"
            />
          ) : (
            // CASE 2: YouTube/Embed - CSS Hack to hide controls/logos
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <iframe
                className="absolute w-[300%] h-[300%] -top-[100%] -left-[100%] opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                src={`https://www.youtube.com/embed/${getVideoID(videoUrl)}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&loop=1&playlist=${getVideoID(videoUrl)}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`}
                title="Footer Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 'none' }}
              ></iframe>
            </div>
          )
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-bold tracking-widest text-2xl">
            GARAGE AESTHETICS
          </div>
        )}
      </div>

      {/*  MAIN CONTENT  */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-center md:text-left">

          {/* 1. LEFT: Brand & Socials */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              {footerData?.header_footerlogo ? (
                <img
                  className="w-10 h-10 md:w-12 md:h-12 object-contain p-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500/20 transition-all duration-300"
                  src={footerData.header_footerlogo}
                  alt="Logo"
                />
              ) : (
                <div className="w-12 h-12 bg-zinc-800 rounded-xl animate-pulse"></div>
              )}

              <span className="text-xl md:text-2xl font-bold tracking-widest italic text-cyan-400">
                {footerData?.header_footerName || "BRAND"}
              </span>
            </div>

            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-mono max-w-xs">
              {footerData?.footerDescription || "Elevating your drive with premium luxury rentals."}
            </p>

            <div className="flex gap-4 pt-2">
              <a href="/help" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-pink-500 hover:border-pink-500/50 hover:bg-black transition-all duration-300 transform hover:scale-110">
                <Instagram size={18} />
              </a>
              <a href="/help" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-green-500 hover:border-green-500/50 hover:bg-black transition-all duration-300 transform hover:scale-110">
                {WhatsAppIcon}
              </a>
            </div>
          </div>

          {/* 2. CENTER: Header Routes */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-[10px] md:text-xs font-bold text-zinc-600 tracking-[0.2em] mb-2 uppercase">Explore</h3>
            {['HOME', 'ABOUT', 'CUSTOMERS', 'SECURITY', 'HELP'].map((item) => (
              <Link
                key={item}
                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                className="text-xs md:text-sm font-bold text-zinc-300 hover:text-cyan-400 hover:tracking-widest transition-all duration-300"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* 3. RIGHT: Legal & Info */}
          <div className="flex flex-col items-center md:items-end justify-center space-y-4">
            <h3 className="text-[10px] md:text-xs font-bold text-zinc-600 tracking-[0.2em] mb-2 uppercase">Legal & Info</h3>

            <Link to="/security" className="flex items-center gap-2 text-xs md:text-sm text-zinc-400 hover:text-white transition-colors group">
              RENTAL AGREEMENT <FileText size={14} className="group-hover:text-cyan-400 transition-colors" />
            </Link>
            <Link to="/security" className="flex items-center gap-2 text-xs md:text-sm text-zinc-400 hover:text-white transition-colors group">
              INSURANCE POLICY <Shield size={14} className="group-hover:text-green-400 transition-colors" />
            </Link>
            <Link to="/security" className="flex items-center gap-2 text-xs md:text-sm text-zinc-400 hover:text-white transition-colors group">
              LOCATIONS <MapPin size={14} className="group-hover:text-red-400 transition-colors" />
            </Link>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-8 md:my-12 opacity-50"></div>

        {/* Bottom Section */}
        <div className="text-center text-[10px] text-zinc-600 font-mono tracking-widest uppercase flex flex-col md:flex-row justify-between items-center gap-2 px-4">
          <p>© {new Date().getFullYear()} {footerData?.footerCopyRight || "COMPANY NAME"}</p>
          <p className="hidden md:block opacity-50">ENGINEERED FOR EXCELLENCE</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;