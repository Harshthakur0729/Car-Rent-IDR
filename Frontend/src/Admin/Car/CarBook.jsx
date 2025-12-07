import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Mail, Car, CreditCard, Filter, Plus, X, ShieldCheck, Hash, MapPin, Image as ImageIcon } from 'lucide-react';

const bookingStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 5, 5, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.2);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
    transition: all 0.3s ease;
  }
  .glass-panel:hover {
    border-color: rgba(220, 38, 38, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 10px 40px rgba(220, 38, 38, 0.2);
  }

  .glass-modal {
    background: rgba(15, 5, 5, 0.98);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(220, 38, 38, 0.4);
    box-shadow: 0 0 60px rgba(220, 38, 38, 0.3);
  }

  .status-badge-completed { 
    background: rgba(16, 185, 129, 0.2); 
    color: #34d399; 
    border: 1px solid rgba(16, 185, 129, 0.3); 
  }
  .status-badge-booked { 
    background: rgba(6, 182, 212, 0.2); 
    color: #22d3ee; 
    border: 1px solid rgba(6, 182, 212, 0.3); 
  }
  .status-badge-cancelled { 
    background: rgba(239, 68, 68, 0.2); 
    color: #f87171; 
    border: 1px solid rgba(239, 68, 68, 0.3); 
  }

  .input-field {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(220, 38, 38, 0.3);
    color: white;
  }
  .input-field:focus {
    border-color: #ef4444;
    outline: none;
    box-shadow: 0 0 10px rgba(220, 38, 38, 0.2);
  }
`;

const CarBook = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedBooking, setSelectedBooking] = useState(null);

  const API = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const token =  localStorage.getItem("adminToken");

        const res = await axios.get(`${API}/admin/getalluser`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        const users = res.data.user || [];


        const allBookingsList = [];

        users.forEach(user => {
          if (user.cars && user.cars.length > 0) {
            user.cars.forEach(carBooking => {
              allBookingsList.push({
                ...carBooking,
                bookedBy: {   
                  username: user.username,
                  email: user.email,
                  profileImage: user.profileImage,
                  userId: user._id,
         
                  card: user.card,
                  cardverify: user.cardverify
                }
              });
            });
          }
        });

        setBookings(allBookingsList.reverse());
        setFilteredBookings(allBookingsList);

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, [API]);


  useEffect(() => {
    let result = bookings;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.carName.toLowerCase().includes(lowerTerm) ||
        b.bookedBy.username.toLowerCase().includes(lowerTerm) ||
        b.bookedBy.email.toLowerCase().includes(lowerTerm)
      );
    }

    if (filterStatus !== 'ALL') {
      result = result.filter(b => b.status.trim().toLowerCase() === filterStatus.toLowerCase());
    }

    setFilteredBookings(result);
  }, [searchTerm, filterStatus, bookings]);

  const getStatusStyle = (status) => {
    const s = status?.trim().toLowerCase() || '';
    if (s === 'booked' || s === 'active') return 'status-badge-booked';
    if (s === 'completed') return 'status-badge-completed';
    return 'status-badge-cancelled';
  };

  const getStatusIcon = (status) => {
    const s = status?.trim().toLowerCase() || '';
    if (s === 'booked' || s === 'active') return <Clock size={14} />;
    if (s === 'completed') return <CheckCircle size={14} />;
    return <XCircle size={14} />;
  };

  //  MODAL HANDLERS 
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const closeDetails = () => {
    setSelectedBooking(null);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-mono animate-pulse">ACCESSING BOOKING RECORDS...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-600 selection:text-white relative pt-20 pb-20 px-6">
      <style>{bookingStyles}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none z-0" />

      {/*  DETAILS MODAL  */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={closeDetails}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-modal w-full max-w-4xl rounded-3xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
            >
              <button onClick={closeDetails} className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"><X size={20} /></button>

              {/* LEFT: USER INFO & DOCS */}
              <div className="w-full md:w-1/2 bg-zinc-900/90 p-8 border-r border-zinc-800 flex flex-col">
                <div className="mb-8 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full border-2 border-red-600 p-1 mb-4">
                    <img
                      src={selectedBooking.bookedBy.profileImage || "https://via.placeholder.com/100"}
                      alt="User"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">{selectedBooking.bookedBy.username}</h2>
                  <p className="text-zinc-500 text-sm font-mono">{selectedBooking.bookedBy.email}</p>

                  <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1 rounded-full text-xs font-bold border ${selectedBooking.bookedBy.cardverify ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}>
                    {selectedBooking.bookedBy.cardverify ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                    {selectedBooking.bookedBy.cardverify ? "IDENTITY VERIFIED" : "NOT VERIFIED"}
                  </div>
                </div>

                <div className="mt-auto">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><ImageIcon size={14} /> Identity Document</h3>
                  <div className="w-full h-84 bg-black rounded-xl border border-zinc-700 overflow-hidden relative group">
                    {selectedBooking.bookedBy.card ? (
                      <img
                        src={selectedBooking.bookedBy.card}
                        alt="ID Card"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs font-mono">NO DOCUMENT UPLOADED</div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: CAR & BOOKING INFO */}
              <div className="w-full md:w-1/2 p-8 bg-black/60 flex flex-col">
                <h3 className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase mb-2">Vehicle Details</h3>
                <h2 className="text-3xl font-black text-white italic uppercase mb-6">{selectedBooking.carName}</h2>

                <div className="w-full h-48 rounded-xl overflow-hidden mb-6 border border-zinc-800 bg-zinc-900">
                  <img
                    src={selectedBooking.carImage || "https://via.placeholder.com/400x300?text=Car"}
                    alt="Car"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Hash size={14} /> Number</span>
                    <span className="text-white font-bold font-mono">{selectedBooking.carNumber}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2"><CreditCard size={14} /> Amount</span>
                    <span className="text-white font-bold font-mono">${selectedBooking.price}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Clock size={14} /> Duration</span>
                    <span className="text-white font-bold font-mono">{selectedBooking.timing || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 mb-1">START</p>
                      <p className="text-xs text-white font-mono">{new Date(selectedBooking.startTime).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 mb-1">END</p>
                      <p className="text-xs text-white font-mono">{new Date(selectedBooking.endTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className={`mt-6 py-3 text-center text-xs font-bold uppercase tracking-widest rounded-lg border ${getStatusStyle(selectedBooking.status)}`}>
                  STATUS: {selectedBooking.status}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">

        {/*  HEADER  */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Admin Console</span>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Booking <span className="text-zinc-600">Log</span></h1>
          </div>

          <div className="flex gap-3 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search car or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full input-field rounded-lg py-2.5 pl-10 pr-4 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none input-field rounded-lg py-2.5 pl-4 pr-10 text-sm cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="booked">Active/Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/*  BOOKINGS LIST  */}
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleViewDetails(booking)} // CLICKABLE ROW
                className="glass-panel rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
              >

                {/* STATUS BADGE (Top Right) */}
                <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </div>

                <div className="flex flex-col md:flex-row gap-8">

                  {/* LEFT SIDE: IMAGES (Car & User) */}
                  <div className="relative flex-shrink-0 w-full md:w-48 flex flex-col items-center justify-center gap-4">
                    {/* Car Image */}
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-zinc-800 bg-black">
                      <img
                        src={booking.carImage || "https://via.placeholder.com/400x300?text=Car"}
                        alt="Car"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* User Image */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-red-600 bg-zinc-900 overflow-hidden shadow-lg shadow-black">
                      {booking.bookedBy.profileImage ? (
                        <img src={booking.bookedBy.profileImage} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={20} className="text-zinc-500" /></div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE: DETAILS */}
                  <div className="flex-1 pt-4 md:pt-0">

                    {/* Row 1: Car Details */}
                    <div className="mb-6 border-b border-zinc-800 pb-4">
                      <h3 className="text-2xl font-black text-white italic uppercase mb-1">{booking.carName}</h3>
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-400">
                        <span className="flex items-center gap-1 text-red-400 font-bold">
                          <CreditCard size={12} /> ${booking.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(booking.startTime).toLocaleDateString()}
                          <span className="text-zinc-600 mx-1">TO</span>
                          {new Date(booking.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: User Details */}
                    <div>
                      <p className="text-[10px] font-bold text-red-500 tracking-widest uppercase mb-2">Booked By Pilot</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-zinc-500" />
                          <span className="text-sm font-bold text-white">{booking.bookedBy.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-zinc-500" />
                          <span className="text-sm text-zinc-400 font-mono">{booking.bookedBy.email}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 glass-panel rounded-2xl border-dashed border-zinc-800">
              <AlertCircle size={40} className="mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-500 font-mono tracking-widest">NO BOOKING RECORDS FOUND</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CarBook;