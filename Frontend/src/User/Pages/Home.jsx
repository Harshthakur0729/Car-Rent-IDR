import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, Fuel, Users, Wind, ShieldCheck, Gauge, MapPin, Music, Sun, Palette, DollarSign, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const homeStyles = `
  html, body {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gridMove {
    0% { background-position: 0 0; }
    100% { background-position: 0 40px; }
  }
  .animate-fade-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
  }
  
  .text-gradient {
    background: linear-gradient(to right, #22d3ee, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .bg-grid-move {
    background-image: linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 3s linear infinite;
  }
  .video-overlay {
    background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8) 80%, #000);
  }
  
  /* Popup Styles */
  .glass-modal {
    background: rgba(10, 10, 10, 0.98);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(6, 182, 212, 0.2);
    box-shadow: 0 0 60px rgba(6, 182, 212, 0.15);
  }
  
  /* Alert Modal Style */
  .glass-alert {
    background: rgba(20, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(239, 68, 68, 0.5);
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.2);
  }
  
  .gallery-scroll::-webkit-scrollbar { display: none; }
  .gallery-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* Hide Scrollbar for Video Strip */
  .hide-scrollbar::-webkit-scrollbar {
      display: none;
  }
  .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cars, setCars] = useState([]);

  const [videoData, setVideoData] = useState({ main: "", subVideo: [] });

  const [verifyUser, setVerifyUser] = useState({});
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const thumbnailRef = useRef(null);
  const [alert, setAlert] = useState({ show: false, message: '' });

  const userData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;
      const res = await axios.get(`${API}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setVerifyUser(res.data.user);
    } catch (error) {
      console.error("User Data Fetch Error:", error);
    }
  };


  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API}/admin/car/nobookedcar`);
      if (res.data && res.data.cars) {
        const mappedCars = res.data.cars.slice(0, 3).map(car => ({
          ...car,
          images: car.images && car.images.length > 0 ? car.images : ["https://via.placeholder.com/600x400?text=No+Image+Available"],
          specs: {
            fuel: car.fuelType || "Petrol",
            type: "Auto",
            seats: `${car.seats || 2} Seats`,
            color: car.color || "Black"
          },
          accentColor: getAccentColor(car.type)
        }));
        setCars(mappedCars);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const fetchVideoData = async () => {
    try {
      const res = await axios.get(`${API}/dynamic/get/video`);
      if (res.data && res.data.data && res.data.data.length > 0) {
        setVideoData(res.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  }

  useEffect(() => {
    userData();
    fetchCars();
    fetchVideoData();

    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [API]);

  const Booknow = (e, car) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem("userToken");
    if (!token) { navigate('/login'); return; }
    if (verifyUser && verifyUser.cardverify === true) {
      navigate('/book-car', { state: car });
    } else {
      setAlert({ show: true, message: "Your identity document is not verified. Please verify your document first to proceed." });
    }
  };

  const handleAlertAction = () => {
    setAlert({ show: false, message: '' });
    navigate('/verify-document');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAccentColor = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("electric")) return "green";
    if (t.includes("sport") || t.includes("hyper")) return "red";
    if (t.includes("suv")) return "purple";
    return "cyan";
  };

  // Modal Handlers
  const openModal = (car) => { setSelectedCar(car); setCurrentImageIndex(0); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setSelectedCar(null); document.body.style.overflow = 'auto'; };
  const nextImage = (e) => { e?.stopPropagation(); if (selectedCar?.images?.length > 1) setCurrentImageIndex((prev) => (prev + 1) % selectedCar.images.length); };
  const prevImage = (e) => { e?.stopPropagation(); if (selectedCar?.images?.length > 1) setCurrentImageIndex((prev) => (prev - 1 + selectedCar.images.length) % selectedCar.images.length); };
  const selectImage = (index) => setCurrentImageIndex(index);

  useEffect(() => {
    if (selectedCar && thumbnailRef.current) {
      const activeThumb = thumbnailRef.current.children[currentImageIndex];
      if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentImageIndex, selectedCar]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      <style>{homeStyles}</style>

      {/*  ALERT MODAL  */}
      <AnimatePresence>
        {alert.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="glass-alert w-full max-w-md p-8 rounded-2xl text-center relative">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500 animate-pulse"><AlertTriangle size={32} className="text-red-500" /></div>
              <h2 className="text-2xl font-black italic text-red-500 mb-4 uppercase">Verification Required</h2>
              <p className="text-zinc-300 font-mono text-sm mb-8 leading-relaxed">{alert.message}</p>
              <button onClick={handleAlertAction} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-widest uppercase rounded-lg shadow-lg shadow-red-900/40 transition-all">Verify Document Now</button>
              <button onClick={() => setAlert({ show: false, message: '' })} className="mt-3 text-zinc-500 text-xs hover:text-white underline">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*  HERO SECTION  */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {/* Main Video */}
            {videoData.main && (
              <iframe width="100%" height="100%" src={videoData.main} title="Supercar Background" frameBorder="0" style={{ objectFit: 'cover', width: '100%', height: '100%' }}></iframe>
            )}
          </div>
          <div className="absolute inset-0 video-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-grid-move z-10 pointer-events-none" style={{ perspective: '500px', transform: 'rotateX(20deg) scale(1.5)' }}></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-6xl mx-auto mt-20">
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-6 animate-fade-up drop-shadow-2xl">RENT THE <span className="text-gradient">EXTRAORDINARY</span></h1>
          <p className="text-zinc-300 text-base md:text-xl font-mono tracking-widest max-w-2xl mx-auto mb-10 animate-fade-up delay-100 border-l-4 border-cyan-500 pl-6 text-left md:text-center md:border-l-0 md:border-b-2 md:pb-6 md:border-cyan-500/50">Drive your dream car today. A curated fleet available for daily, weekly, and exclusive monthly packages.</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-fade-up delay-200">
            <Link to="/customers" className="px-12 py-4 bg-cyan-600 text-black font-bold text-sm tracking-[0.25em] skew-x-[-15deg] hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)]"><span className="block skew-x-[15deg]">BOOK NOW</span></Link>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg></div>
      </section>

      {/*  DYNAMIC SERVICE VIDEO STRIP  */}
      <section className="py-20 bg-zinc-950 border-y border-zinc-900 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">

          {(() => {
            const subVideos = videoData.subVideo || [];
            const count = subVideos.length;

            let containerClass = "";

            if (count === 1) {
              // 1 Video: Center
              containerClass = "flex justify-center";
            } else if (count === 2) {
              // 2 Videos: Space Between (Left & Right)
              containerClass = "flex flex-col md:flex-row justify-between gap-8";
            } else {
              // 3+ Videos: Horizontal Scroll
              containerClass = "flex gap-8 overflow-x-auto hide-scrollbar pb-4";
            }

            return (
              <div className={containerClass}>
                {subVideos.map((videoSrc, idx) => (
                  <div
                    key={idx}
                    className={`
                                    relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-black/40 
                                    hover:border-cyan-500/50 transition-all duration-500 group hover:-translate-y-2 
                                    flex-shrink-0 w-full
                                    ${count >= 3 ? "md:w-[350px]" : "md:w-[48%]"} 
                                    ${count === 1 ? "md:w-[600px] " : ""}
                                `}
                  >
                    <video
                      src={videoSrc}
                      className="w-full h-60 object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                    {/* Optional Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300 pointer-events-none"></div>
                  </div>
                ))}

                {count === 0 && (
                  <div className="w-full text-center py-10 text-zinc-600 text-sm italic">
                    Experience the thrill. Videos coming soon.
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </section>

      {/*  DYNAMIC RENTALS SHOWCASE  */}
      {/* Same as before */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-zinc-900/20 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div><span className="text-cyan-500 font-mono text-xs tracking-widest mb-2 block">AVAILABLE FOR BOOKING</span><h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Rentals</span></h2></div>
            <Link to="/customers" className="flex items-center gap-2 text-sm font-bold tracking-widest text-zinc-500 hover:text-white transition-colors group">SEE ALL CARS <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car, index) => (
              <div key={car._id || index} onClick={() => openModal(car)} className={`group relative h-[500px] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:border-${car.accentColor || 'cyan'}-500/50 flex flex-col hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer`}>
                <div className="h-[60%] relative overflow-hidden">
                  <img src={car.images[0]} alt={car.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-2 rounded-full border border-white/10 text-white group-hover:bg-cyan-500 group-hover:text-black transition-colors"><Gauge size={16} /></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold tracking-widest uppercase text-white">{car.type || "LUXURY"}</div>
                </div>
                <div className="flex-1 p-8 flex flex-col justify-between bg-zinc-900 relative z-10">
                  <div>
                    <div className="flex justify-between items-start mb-2"><h3 className="text-2xl font-black text-white italic uppercase leading-none">{car.name}</h3><div className="text-right"><span className={`block text-lg font-bold text-${car.accentColor || 'cyan'}-400`}>${Number(car.price).toLocaleString()}</span><span className="text-[10px] text-zinc-500">PER DAY</span></div></div>
                    <div className="flex flex-wrap gap-2 text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-6"><span className="px-2 py-1 border border-zinc-800 rounded bg-black/30 flex items-center gap-1"><Fuel size={10} /> {car.specs.fuel}</span><span className="px-2 py-1 border border-zinc-800 rounded bg-black/30 flex items-center gap-1"><Users size={10} /> {car.specs.seats}</span></div>
                  </div>
                  <div className="flex gap-3"><button className="flex-1 py-3 bg-zinc-800 border border-zinc-700 hover:bg-cyan-900/40 hover:border-cyan-500 hover:text-cyan-400 text-center text-xs font-bold tracking-widest text-white transition-all uppercase rounded-lg">View Details</button><button onClick={(e) => { Booknow(e, car); }} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-black text-center text-xs font-bold tracking-widest transition-all uppercase rounded-lg shadow-lg hover:shadow-cyan-500/50">Book Now</button></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  DETAILS MODAL  */}
      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="glass-modal w-full max-w-6xl rounded-3xl overflow-hidden relative flex flex-col lg:flex-row max-h-[90vh] lg:h-[80vh]">
              <button onClick={closeModal} className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"><X size={24} /></button>
              <div className="w-full lg:w-3/5 bg-black relative group flex flex-col h-[40vh] lg:h-auto">
                <div className="flex-1 relative overflow-hidden bg-zinc-950 flex items-center justify-center">
                  <img src={selectedCar.images[currentImageIndex]} alt={selectedCar.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent lg:hidden" />
                  {selectedCar.images.length > 1 && (<><button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-cyan-600 transition-all"><ChevronLeft size={24} /></button><button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-cyan-600 transition-all"><ChevronRight size={24} /></button></>)}
                </div>
                {selectedCar.images.length > 1 && (<div ref={thumbnailRef} className="h-24 bg-zinc-950 flex items-center gap-3 px-4 overflow-x-auto gallery-scroll border-t border-zinc-800 shrink-0">{selectedCar.images.map((img, idx) => (<div key={idx} onClick={() => selectImage(idx)} className={`h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${currentImageIndex === idx ? 'border-cyan-500 opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}><img src={img} className="w-full h-full object-cover" alt={`thumb ${idx}`} /></div>))}</div>)}
              </div>
              <div className="w-full lg:w-[45%] p-8 bg-zinc-900/95 border-l border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2"><span className="px-3 py-1 bg-cyan-900/30 text-cyan-400 text-[10px] font-bold rounded border border-cyan-900/50 uppercase tracking-widest">{selectedCar.brand}</span><span className="text-zinc-500 text-xs font-mono">Model {selectedCar.year}</span></div>
                  <h2 className="text-4xl lg:text-5xl font-black italic text-white uppercase leading-none mb-4">{selectedCar.name}</h2>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800"><div><span className="block text-3xl font-bold text-white">${Number(selectedCar.price).toLocaleString()}</span><span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">PER DAY</span></div><button onClick={(e) => { closeModal(); Booknow(e, selectedCar); }} className="px-8 py-4 bg-white text-black font-bold text-xs rounded-lg uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2 group"><span>Book Now</span> <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></button></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Gauge size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Type</p><p className="text-xs text-white font-bold uppercase">{selectedCar.type}</p></div>
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Fuel size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Fuel</p><p className="text-xs text-white font-bold">{selectedCar.specs.fuel}</p></div>
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Users size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Seats</p><p className="text-xs text-white font-bold">{selectedCar.specs.seats}</p></div>
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Palette size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Color</p><p className="text-xs text-white font-bold capitalize">{selectedCar.specs.color}</p></div>
                </div>
                <div className="mb-8"><h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={12} /> Premium Features</h3><div className="flex flex-wrap gap-2">{selectedCar.AC && <span className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1"><Wind size={10} /> AC</span>}{selectedCar.GPS && <span className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1"><MapPin size={10} /> GPS Navigation</span>}{selectedCar.musicSystem && <span className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1"><Music size={10} /> Premium Audio</span>}{selectedCar.airbags && <span className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1"><ShieldCheck size={10} /> Airbags</span>}{selectedCar.sunroof && <span className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1"><Sun size={10} /> Sunroof</span>}</div>{(!selectedCar.AC && !selectedCar.GPS && !selectedCar.musicSystem && !selectedCar.airbags && !selectedCar.sunroof) && (<p className="text-xs text-zinc-600 italic">Standard configuration.</p>)}</div>
                <div><h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2"><DollarSign size={12} /> Vehicle Overview</h3><p className="text-sm text-zinc-300 leading-relaxed font-light border-l-2 border-cyan-500/30 pl-4">{selectedCar.description}</p></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button onClick={scrollToTop} className={`fixed bottom-8 right-8 z-50 p-4 bg-cyan-600 text-black rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:bg-white transition-all duration-500 transform hover:-translate-y-1 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`} aria-label="Scroll to top"><ChevronRight size={24} className="-rotate-90" strokeWidth={3} /></button>
    </div>
  );
};

export default Home;