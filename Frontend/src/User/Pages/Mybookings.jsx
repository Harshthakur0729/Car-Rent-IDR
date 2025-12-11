import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Car, Plus, X, AlertTriangle } from 'lucide-react';

const bookingStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* New Style for Cancel Popup */
  .glass-modal-danger {
    background: rgba(25, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 50px rgba(239, 68, 68, 0.2);
  }

  .status-active { color: #22d3ee; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); }
  .status-completed { color: #34d399; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); }
  .status-cancelled { color: #f87171; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
`;

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const processingIds = useRef(new Set());

  const API = import.meta.env.VITE_BACKEND_URL

  // 1. Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("userToken");
        // Only fetch if token exists
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API}/user/profile`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });

        setBookings(res.data.user.cars || []);

      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, API]);


  // 2. Logic to Auto-Complete Ride when Time is Out
  useEffect(() => {
    // Function to check and complete rides
    const checkAndCompleteRides = async () => {
      if (!bookings || bookings.length === 0) return;

      const now = new Date();
      const token = localStorage.getItem("userToken");

      bookings.forEach(async (booking) => {
        // Ensure booking has necessary fields
        if (!booking.endTime) return;

        const endTime = new Date(booking.endTime);

        // Check if status is 'booked', time has passed, and we aren't already processing this ID
        if (
          booking.status === 'booked' &&
          booking._id &&
          now > endTime &&
          !processingIds.current.has(booking._id)
        ) {

          // Mark as processing so we don't hit API twice in next loop
          processingIds.current.add(booking._id);
          console.log(`Time out for booking ${booking._id}. Completing ride...`);

          try {
            // Call the new route you requested
            const res = await axios.post(
              `${API}/user/car-ride-complete/${booking._id}`,
              { carId: booking._id }, // Updated: Sending booking._id to match typical backend ID requirements
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
              }
            );

            if (res.status === 200) {
              // Update local state to show "completed"
              setBookings(prevBookings =>
                prevBookings.map(b =>
                  b._id === booking._id ? { ...b, status: 'completed' } : b
                )
              );
            }
          } catch (error) {
            console.error(`Failed to auto-complete ride ${booking._id}:`, error);
            // Remove from processing if failed so it can try again
            processingIds.current.delete(booking._id);
          }
        }
      });
    };

    // Run check immediately
    checkAndCompleteRides();

    // Set interval to check every 5 seconds
    const intervalId = setInterval(checkAndCompleteRides, 5000);

    return () => clearInterval(intervalId);
  }, [bookings, API]);


  const initiateCancel = (bookingId) => {
    setBookingToCancel(bookingId);
    setIsCancelModalOpen(true);
  };


  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      const token = localStorage.getItem("userToken");

      const res = await axios.post(`${API}/user/car-booking-cancel/${bookingToCancel}`,
        { carId: bookingToCancel },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      if (res.status === 200) {
        const updatedBookings = bookings.map(b =>
          (b._id === bookingToCancel || b.carId === bookingToCancel) ? { ...b, status: 'cancelled' } : b
        );
        setBookings(updatedBookings);

        setIsCancelModalOpen(false);
        setBookingToCancel(null);
      }

    } catch (error) {
      console.error("Cancel Error:", error);
      alert(error.response?.data?.message || "Failed to cancel booking.");
      setIsCancelModalOpen(false);
    }
  };


  const getStatusStyle = (status) => {
    if (!status) return 'status-cancelled';
    const s = status.toLowerCase().trim();
    if (s.includes('booked') || s.includes('active')) return 'status-active';
    if (s.includes('completed')) return 'status-completed';
    return 'status-cancelled';
  };

  const getStatusIcon = (status) => {
    if (!status) return <XCircle size={14} />;
    const s = status.toLowerCase().trim();
    if (s.includes('booked') || s.includes('active')) return <Clock size={14} />;
    if (s.includes('completed')) return <CheckCircle size={14} />;
    return <XCircle size={14} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono tracking-widest">
        RETRIEVING GARAGE LOGS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden pt-24 pb-20 relative">
      <style>{bookingStyles}</style>

      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* CANCEL CONFIRMATION MODAL  */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal-danger w-full max-w-sm rounded-3xl p-8 relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border-2 border-red-600 animate-pulse">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Cancel Booking?</h2>
              <p className="text-zinc-300 text-xs mb-6 font-mono leading-relaxed">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold tracking-widest transition-all"
                >
                  RETURN
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest transition-all shadow-lg shadow-red-900/40"
                >
                  CONFIRM CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* HEADER SECTION WITH BOOK MORE BUTTON  */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Digital Log</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              My <span className="text-zinc-500">Bookings</span>
            </h1>
          </motion.div>

          {/* BOOK MORE BUTTON (Right Corner) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link
              to="/customers"
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs tracking-widest uppercase rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transform hover:-translate-y-1"
            >
              <Plus size={16} strokeWidth={3} /> Book More
            </Link>
          </motion.div>
        </div>

        {/* BOOKING LIST  */}
        <div className="space-y-6">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <motion.div
                key={booking._id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row group hover:border-cyan-500/30 transition-all duration-500"
              >

                {/* Car Image Section */}
                <div className="w-full md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-zinc-900">
                  <img
                    src={booking.carImage || "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={booking.carName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent md:bg-gradient-to-r" />

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl font-black italic text-white">${booking.price}</span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">

                  {/* Top Row: Name, Number & Status */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-black italic text-cyan-500 uppercase tracking-wide">{booking.carName}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500 mt-2">
                        <span className="bg-zinc-800/50 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300 tracking-wider">
                          {booking.carNumber}
                        </span>
                        <span className="text-zinc-700">|</span>
                        {booking._id && <span>ID: #{booking._id.slice(-6).toUpperCase()}</span>}
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusStyle(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                  </div>

                  {/* Middle Row: Dates */}
                  <div className="grid grid-cols-2 gap-6 py-4 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Start Time</span>
                      <div className="flex items-center gap-2 text-sm text-zinc-300 font-mono">
                        <Calendar size={14} className="text-cyan-500" />
                        {booking.startTime ? new Date(booking.startTime).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">End Time</span>
                      <div className="flex items-center gap-2 text-sm text-zinc-300 font-mono">
                        <Calendar size={14} className="text-cyan-500" />
                        {booking.endTime ? new Date(booking.endTime).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Time Duration</span>
                      <div className="flex items-center gap-2 text-sm text-zinc-300 font-mono">
                        <Clock size={14} className="text-cyan-500" />
                        {booking.timing || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* CANCEL BUTTON SECTION (Only if booked) */}
                  {booking.status === 'booked' && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => initiateCancel(booking._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-900/50 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        <X size={14} /> Cancel Booking
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 glass-panel rounded-3xl border-dashed border-zinc-800"
            >
              <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600 border border-zinc-800">
                <Car size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Garage Empty</h3>
              <p className="text-zinc-500 text-sm mb-8 font-mono">You haven't booked any vehicles yet.</p>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBookings;