import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, Fuel, Users, Wind, AlertTriangle, ShieldCheck, Gauge, MapPin, Music, Sun, Palette, DollarSign, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const customerStyles = `
  /* HIDE SCROLLBAR BUT KEEP SCROLLING */
  html, body {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gridMove {
    0% { background-position: 0 0; }
    100% { background-position: 0 40px; }
  }

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
    opacity: 0;
  }
  
  .glass-filter {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
  .active-tab {
    background: #06b6d4;
    color: black;
    border-color: #06b6d4;
    box-shadow: 0 0 20px rgba(6,182,212, 0.5);
  }

  .glass-modal {
    background: rgba(10, 10, 10, 0.98);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(6, 182, 212, 0.2);
    box-shadow: 0 0 60px rgba(6, 182, 212, 0.15);
  }

  .bg-grid-move {
    background-image: linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 3s linear infinite;
  }
  
  .video-overlay {
    background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9) 90%, #000);
  }
  
  /* FORCE HIDE VIDEO CONTROLS */
  video::-webkit-media-controls {
      display: none !important;
  }
  video::-webkit-media-controls-enclosure {
      display: none !important;
  }
  video {
      pointer-events: none; 
  }
`;

const AvailableCar = () => {
  const navigate = useNavigate();
  const [visibleCars, setVisibleCars] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [selectedCar, setSelectedCar] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [verifyUser, setVerifyUser] = useState({});
  const thumbnailRef = useRef(null);
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [videoUrl, setVideoUrl] = useState(null);

  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
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
        setVisibleCars(res.data.cars);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
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

  useEffect(() => {
    userData();
    fetchCars();
    fetchVideoData();
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

  useEffect(() => {
    if (selectedCar && thumbnailRef.current) {
      const activeThumb = thumbnailRef.current.children[currentImageIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentImageIndex, selectedCar]);

  const getAccentColor = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("electric")) return "green";
    if (t.includes("sport") || t.includes("hyper")) return "red";
    if (t.includes("suv")) return "purple";
    return "cyan";
  };

  const openModal = (car) => { setSelectedCar(car); setCurrentImageIndex(0); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setSelectedCar(null); document.body.style.overflow = 'auto'; };
  const nextImage = (e) => { e?.stopPropagation(); if (selectedCar?.images?.length > 1) setCurrentImageIndex((prev) => (prev + 1) % selectedCar.images.length); };
  const prevImage = (e) => { e?.stopPropagation(); if (selectedCar?.images?.length > 1) setCurrentImageIndex((prev) => (prev - 1 + selectedCar.images.length) % selectedCar.images.length); };
  const selectImage = (index) => { setCurrentImageIndex(index); }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden ">
      <style>{customerStyles}</style>
      
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

      {/* HERO SECTION  */}
      <section className="relative h-[60vh] w-full flex flex-col items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[100%] h-[100%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            
            {/* DIRECT VIDEO ONLY */}
            {videoUrl && (
                <video
                    src={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
            )}

          </div>
          <div className="absolute inset-0 video-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-grid-move z-10 pointer-events-none" style={{ perspective: '500px', transform: 'rotateX(20deg) scale(1.5)' }}></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-6xl mx-auto mt-10">
          <span className="text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase mb-4 block animate-fade-in">The Garage</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 animate-fade-in delay-100">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Weapon</span>
          </h1>
        </div>
      </section>

      {/* CAR GRID  */}
      <section className="px-6 max-w-7xl mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleCars.length > 0 ? (
            visibleCars.map((rawCar, index) => {
              const car = {
                ...rawCar,
                images: rawCar.images && rawCar.images.length > 0 ? rawCar.images : ["https://via.placeholder.com/400x300?text=No+Image"],
                accentColor: getAccentColor(rawCar.type),
                specs: {
                  fuel: rawCar.fuelType || 'N/A',
                  seats: `${rawCar.seats || '2'} Seats`,
                  color: rawCar.color || 'Black'
                }
              };

              return (
                <div key={car._id || index} onClick={() => openModal(car)} className={`group relative h-[450px] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-cyan-500/50 transition-all duration-500 animate-fade-in hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] cursor-pointer`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="h-3/5 w-full overflow-hidden relative bg-zinc-950">
                    <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">{car.type || "LUXURY"}</div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-zinc-900 border-t border-zinc-800/50">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <h3 className="text-xl font-black italic text-white uppercase truncate max-w-[150px]">{car.name}</h3>
                        <div className="flex gap-3 mt-2 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                          <span className="px-2 py-1 border border-zinc-800 rounded bg-black/30 flex items-center gap-1"><Fuel size={10} /> {car.specs.fuel}</span>
                          <span className="px-2 py-1 border border-zinc-800 rounded bg-black/30 flex items-center gap-1"><Users size={10} /> {car.specs.seats}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-cyan-400">${Number(car.price).toLocaleString()}</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">/ DAY</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-zinc-800 border border-zinc-700 hover:bg-cyan-900/40 hover:border-cyan-500 hover:text-cyan-400 text-center text-xs font-bold tracking-widest text-white transition-all uppercase rounded-lg">View Details</button>
                      <button onClick={(e) => { Booknow(e, car); }} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-black text-center text-xs font-bold tracking-widest transition-all uppercase rounded-lg shadow-lg hover:shadow-cyan-500/50">Book Now</button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 glass-filter rounded-2xl">
              <p className="text-zinc-400 font-mono tracking-widest text-lg">NO VEHICLES FOUND.</p>
              <p className="text-zinc-600 text-xs mt-2">Data will appear once added by Admin.</p>
            </div>
          )}
        </div>
      </section>

      {/* ENHANCED CAR DETAILS MODAL  */}
      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="glass-modal w-full max-w-6xl rounded-3xl overflow-hidden relative flex flex-col lg:flex-row max-h-[90vh] lg:h-[80vh]">
              <button onClick={closeModal} className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"><X size={24} /></button>
              <div className="w-full lg:w-[55%] bg-black relative group flex flex-col h-[40vh] lg:h-auto">
                <div className="flex-1 relative overflow-hidden bg-zinc-950 flex items-center justify-center">
                  <img src={selectedCar.images?.[currentImageIndex]} alt={`${selectedCar.name} view ${currentImageIndex}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent lg:hidden" />
                  {selectedCar.images?.length > 1 && (<><button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-cyan-600 transition-all"><ChevronLeft size={24} /></button><button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-cyan-600 transition-all"><ChevronRight size={24} /></button></>)}
                </div>
                {selectedCar.images?.length > 1 && (<div ref={thumbnailRef} className="h-24 bg-zinc-950 flex items-center gap-3 px-4 overflow-x-auto gallery-scroll border-t border-zinc-800 shrink-0">{selectedCar.images.map((img, idx) => (<div key={idx} onClick={() => selectImage(idx)} className={`h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${currentImageIndex === idx ? 'border-cyan-500 opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}><img src={img} className="w-full h-full object-cover" alt={`thumb ${idx}`} /></div>))}</div>)}
              </div>
              <div className="w-full lg:w-[45%] p-8 bg-zinc-900/95 border-l border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2"><span className="px-3 py-1 bg-cyan-900/30 text-cyan-400 text-[10px] font-bold rounded border border-cyan-900/50 uppercase tracking-widest">{selectedCar.brand}</span><span className="text-zinc-500 text-xs font-mono">Model {selectedCar.year}</span></div>
                  <h2 className="text-4xl lg:text-5xl font-black italic text-white uppercase leading-none mb-4">{selectedCar.name}</h2>
                  <h2 className="text-xl lg:text-xl  italic text-white uppercase leading-none mb-4"> <b>Car Number Plate : </b> {selectedCar.carnumber}</h2>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800"><div><span className="block text-3xl font-bold text-white">${Number(selectedCar.price).toLocaleString()}</span><span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">PER DAY</span></div><button onClick={(e) => { closeModal(); Booknow(e, selectedCar); }} className="px-8 py-4 bg-white text-black font-bold text-xs rounded-lg uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2 group"><span>Book Now</span> <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></button></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Gauge size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Type</p><p className="text-xs text-white font-bold uppercase">{selectedCar.type}</p></div>
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Fuel size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Fuel</p><p className="text-xs text-white font-bold">{selectedCar.fuelType}</p></div>
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Users size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Seats</p><p className="text-xs text-white font-bold">{selectedCar.seats}</p></div>
                  <div className="p-2 bg-black/40 rounded border border-zinc-800 text-center"><Palette size={16} className="text-cyan-500 mx-auto mb-1" /><p className="text-[9px] text-zinc-500 uppercase">Color</p><p className="text-xs text-white font-bold capitalize">{selectedCar.color || 'N/A'}</p></div>
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

export default AvailableCar;