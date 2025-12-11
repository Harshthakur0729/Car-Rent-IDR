import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const headerStyles = `
  .nav-link {
    position: relative;
    transition: all 0.3s ease;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: #06b6d4; /* Cyan-500 */
    transition: width 0.3s ease;
    box-shadow: 0 0 10px #06b6d4;
  }
  .nav-link:hover::after {
    width: 100%;
  }
  .nav-link:hover {
    color: #fff;
    text-shadow: 0 0 8px rgba(6,182,212, 0.6);
  }
  .mobile-menu-enter {
    animation: slideDown 0.3s ease-out forwards;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slowZoom {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }
  .animate-slow-zoom {
    animation: slowZoom 20s alternate infinite;
  }
`;

const Header = ({ datas }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();


  const API = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("userToken");

  const [data, setData] = useState({})
  const fetchProfile = async () => {
    try {

      const res = await axios.get(`${API}/user/profile`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      setData({ profileImage: res.data.user.profileImage, username: res.data.user.username });

    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };



  useEffect(() => {

    fetchProfile();
  }, [navigate, API]);

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: ' AVAILABLE CAR', path: '/customers' },
    { name: 'SECURITY', path: '/security' },
    { name: 'HELP', path: '/help' },
  ];

  // SVG Icons
  const MenuIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" />
    </svg>
  );
  const CloseIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );


  return (
    <div className="relative w-full bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      <style>{headerStyles}</style>

      <div className="absolute top-0 left-0 w-full h-24 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-10" />
        <img src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2835&auto=format&fit=crop" alt="Header Background" className="w-full h-full object-cover object-center opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:60px_60px] z-10 pointer-events-none" />
      </div>

      <header className="relative w-full z-50 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">

            <Link className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-500/10 border-2 overflow-hidden border-cyan-500/30 group-hover:bg-cyan-500/20 transition-all duration-300">

                <img className="text-cyan-400 group-hover:text-white transition-colors duration-300 w-full h-full"
                  src={datas.header_footerlogo} alt="" />
              </div>
              <span className="text-xl font-bold text-cyan-400  tracking-widest italic">{datas.header_footerName}</span>

            </Link>

            <div className="hidden lg:flex items-center space-x-10">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} className="nav-link text-xs font-bold text-zinc-300 tracking-widest hover:text-white">{item.name}</Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-6 pl-8 border-l border-white/10">
              <Link to="/my-bookings" className="text-xs font-bold text-zinc-400 hover:text-cyan-400 tracking-widest transition-colors uppercase">My Bookings</Link>
              <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
                <div className="text-right">
                  <span className="block text-xs font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors">{data.username}</span>
                  <span className="block text-[9px] font-mono text-cyan-500/80 tracking-widest">STATUS: ACTIVE</span>
                </div>
                <div className="relative">
                  <img src={data.profileImage} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-zinc-700 group-hover:border-cyan-400 transition-all duration-300 object-cover shadow-[0_0_15px_rgba(6,182,212,0.2)]" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
              </Link>
            </div>

            <div className="lg:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-300 hover:text-white focus:outline-none p-2">{isMobileMenuOpen ? CloseIcon : MenuIcon}</button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden relative z-20 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 mobile-menu-enter">
            <div className="px-6 pt-4 pb-8 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10 cursor-pointer " onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}>
                <img src={data.profileImage} alt="User" className="w-12 h-12 rounded-full border-2 border-cyan-500/50  object-center object-scale-down" />
                <div>
                  <div className="text-sm font-bold text-white ">My Profile</div>
                  <div className="text-xs text-zinc-500">View Account</div>
                </div>
              </div>
              <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold text-cyan-400 hover:text-white hover:pl-2 transition-all duration-300 tracking-widest border-b border-white/5 pb-4 mb-2">MY BOOKINGS</Link>
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold text-zinc-400 hover:text-white hover:pl-2 transition-all duration-300 tracking-widest">{item.name}</Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;