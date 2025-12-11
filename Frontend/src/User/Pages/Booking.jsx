import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, DollarSign, CheckCircle, AlertTriangle, Car, ShieldCheck, Hourglass, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const bookStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.2);
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
  }

  .input-field {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    color-scheme: dark; 
  }
  .input-field:focus {
    border-color: #06b6d4;
    outline: none;
    box-shadow: 0 0 15px rgba(6,182,212, 0.2);
  }
  .input-disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .glass-alert {
    background: rgba(10, 10, 10, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.3);
    box-shadow: 0 0 50px rgba(6, 182, 212, 0.2);
  }

  /* Toggle Switch Style */
  .booking-type-btn {
    transition: all 0.3s ease;
  }
  .booking-type-btn.active {
    background: #06b6d4;
    color: black;
    box-shadow: 0 0 20px rgba(6,182,212, 0.4);
  }
  
  /* Hourly Package Card */
  .hourly-card {
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.4);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .hourly-card:hover {
    border-color: rgba(6,182,212,0.5);
  }
  .hourly-card.selected {
    background: rgba(6,182,212,0.15);
    border-color: #06b6d4;
    box-shadow: 0 0 15px rgba(6,182,212, 0.15);
  }
`;

const BookCar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const carData = location.state?.car || location.state;

    const [bookingType, setBookingType] = useState('daily');

    const [dailyDates, setDailyDates] = useState({ start: '', end: '' });
    const [hourlyData, setHourlyData] = useState({ start: '', end: '' });

    const [totalPrice, setTotalPrice] = useState(0);
    const [durationLabel, setDurationLabel] = useState('Select Duration');

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [calculatedEndTime, setCalculatedEndTime] = useState('');

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

    const API = import.meta.env.VITE_BACKEND_URL;

    const hourlyPackages = [
        { hours: 1, price: 100 },
        { hours: 3, price: 500 },
        { hours: 6, price: 1000 },
        { hours: 8, price: 1300 },
        { hours: 12, price: 1600 },
    ];

    useEffect(() => {
        if (!carData) {
            console.error("No car data found in location state");
            navigate('/');
        }
    }, [carData, navigate]);
    useEffect(() => {
        if (bookingType === 'daily') {
            if (dailyDates.start && dailyDates.end && carData) {
                const start = new Date(dailyDates.start);
                const end = new Date(dailyDates.end);
                const timeDiff = end - start;
                const dayDiff = timeDiff / (1000 * 3600 * 24);

                if (dayDiff > 0) {
                    const days = Math.ceil(dayDiff);
                    setDurationLabel(`${days} Days`);
                    setTotalPrice(days * parseInt(carData.price));
                } else {
                    setTotalPrice(0);
                    setDurationLabel('Invalid Dates');
                }
            }
        } else {
            if (selectedPackage && hourlyData.start) {
                setTotalPrice(selectedPackage.price);
                setDurationLabel(`${selectedPackage.hours} Hours`);

                const [startH, startM] = hourlyData.start.split(':').map(Number);
                let endH = startH + selectedPackage.hours;
                let endM = startM;

                if (endH >= 24) endH -= 24;
                const displayTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                setCalculatedEndTime(displayTime);
            } else {
                setCalculatedEndTime('');
            }
        }
    }, [dailyDates, hourlyData, bookingType, selectedPackage, carData]);

    const handleDailyChange = (e) => {
        setDailyDates({ ...dailyDates, [e.target.name]: e.target.value });
    };

    const handleHourlyInputChange = (e) => {
        setHourlyData({ ...hourlyData, [e.target.name]: e.target.value });
    };

    const handlePackageSelect = (pkg) => {
        if (!hourlyData.start) {
            setAlert({ show: true, type: 'error', message: 'Please select a Start Time first.' });
            return;
        }
        setSelectedPackage(pkg);
        setTotalPrice(pkg.price);
        setDurationLabel(`${pkg.hours} Hours`);
        const [hours, minutes] = hourlyData.start.split(':').map(Number);
        let endH = hours + pkg.hours;
        let endM = minutes;

        if (endH >= 24) endH -= 24;

        const formattedEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        setHourlyData(prev => ({ ...prev, end: formattedEnd }));
    };

    const closeAlert = () => {
        setAlert({ ...alert, show: false });
        if (alert.type === 'success') {
            navigate('/my-bookings');
        } else if (alert.message.includes("not verified")) {
            navigate('/'); // Redirect to home if verification fails
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        let startISO, endISO;

        if (bookingType === 'daily') {
            if (!dailyDates.start || !dailyDates.end || totalPrice <= 0) {
                setAlert({ show: true, type: 'error', message: 'Please select valid dates.' });
                return;
            }
            startISO = new Date(dailyDates.start).toISOString();
            endISO = new Date(dailyDates.end).toISOString();
        } else {
            if (!hourlyData.start || !hourlyData.end || totalPrice <= 0) {
                setAlert({ show: true, type: 'error', message: 'Please select time and duration.' });
                return;
            }

            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            startISO = new Date(`${todayStr}T${hourlyData.start}`).toISOString();

            let endDateTimeStr = `${todayStr}T${hourlyData.end}`;
            if (hourlyData.end < hourlyData.start) {
                const nextDay = new Date(today);
                nextDay.setDate(nextDay.getDate() + 1);
                const ndY = nextDay.getFullYear();
                const ndM = String(nextDay.getMonth() + 1).padStart(2, '0');
                const ndD = String(nextDay.getDate()).padStart(2, '0');
                endDateTimeStr = `${ndY}-${ndM}-${ndD}T${hourlyData.end}`;
            }
            endISO = new Date(endDateTimeStr).toISOString();
        }

        setLoading(true);
        const token = localStorage.getItem("userToken");

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const profileRes = await axios.get(`${API}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            const user = profileRes.data.user;

            if (!user || user.cardverify !== true) {
                setLoading(false);
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Access Denied: Your document verification is pending. Please wait for approval.'
                });
                return;
            }


            const payload = {
                carImage: carData.images ? carData.images[0] : "",
                carNumber: carData.carnumber || "N/A",
                carName: carData.name,
                price: totalPrice.toString(),
                timing: durationLabel,
                startTime: startISO,
                endTime: endISO
            };

            const bookRes = await axios.post(`${API}/user/car-booking`, payload, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            setAlert({
                show: true,
                type: 'success',
                message: bookRes.data.message || 'Booking Confirmed Successfully!'
            });

        } catch (error) {
            console.error("Booking Error:", error);
            const msg = error.response?.data?.message || "Booking failed. Server error.";
            setAlert({ show: true, type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    if (!carData) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden pt-24 pb-20 relative px-6">
            <style>{bookStyles}</style>

            {/* Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0" />

            {/*  ALERT POPUP  */}
            <AnimatePresence>
                {alert.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            className={`glass-alert w-full max-w-md p-8 rounded-2xl text-center border ${alert.type === 'success' ? 'border-green-500' : 'border-red-500'}`}
                        >
                            <div className="mb-4 flex justify-center">
                                {alert.type === 'success'
                                    ? <CheckCircle size={64} className="text-green-500" />
                                    : <AlertTriangle size={64} className="text-red-500" />
                                }
                            </div>
                            <h2 className={`text-2xl font-black uppercase italic tracking-wider mb-2 ${alert.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                {alert.type === 'success' ? 'BOOKING CONFIRMED' : 'ERROR'}
                            </h2>
                            <p className="text-zinc-400 text-sm mb-8 font-mono">{alert.message}</p>
                            <button
                                onClick={closeAlert}
                                className={`w-full py-3 font-bold text-xs tracking-[0.2em] uppercase rounded-lg transition-all ${alert.type === 'success' ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                            >
                                {alert.type === 'success' ? 'VIEW MY BOOKINGS' : 'CLOSE'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 max-w-6xl mx-auto">

                <div className="mb-10 text-center">
                    <span className="text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase block mb-2">Secure Reservation</span>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">Confirm <span className="text-zinc-500">Booking</span></h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/*  LEFT: CAR SUMMARY  */}
                    <div className="glass-panel rounded-3xl p-8 flex flex-col h-full">
                        <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-zinc-900 mb-8 border border-zinc-800">
                            <img src={carData.images?.[0]} alt={carData.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4">
                                <h2 className="text-2xl font-black italic uppercase text-white">{carData.name}</h2>
                                <p className="text-cyan-400 text-xs font-mono tracking-widest">{carData.brand} {carData.type}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2"><DollarSign size={14} /> Base Rate (Daily)</span>
                                <span className="text-white font-bold font-mono">₹{carData.price}</span>
                            </div>
                            {/* Dynamic Car Number */}
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Hash size={14} /> Car Number</span>
                                <span className="text-white font-bold font-mono">{carData.carnumber || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Car size={14} /> Fuel Type</span>
                                <span className="text-white font-bold font-mono">{carData.fuelType}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={14} /> Insurance</span>
                                <span className="text-green-400 font-bold font-mono text-xs">INCLUDED</span>
                            </div>
                        </div>
                    </div>

                    {/*  RIGHT: BOOKING FORM  */}
                    <div className="glass-panel rounded-3xl p-8 border-t-4 border-cyan-500">

                        {/* Booking Type Toggle */}
                        <div className="flex bg-zinc-900 p-1 rounded-lg mb-8 border border-zinc-800">
                            <button
                                onClick={() => { setBookingType('daily'); setTotalPrice(0); setDailyDates({ start: '', end: '' }); setDurationLabel('Select Dates'); }}
                                className={`flex-1 py-2 text-xs font-bold tracking-widest rounded-md booking-type-btn ${bookingType === 'daily' ? 'active' : 'text-zinc-500 hover:text-white'}`}
                            >
                                DAILY RENTAL
                            </button>
                            <button
                                onClick={() => { setBookingType('hourly'); setTotalPrice(0); setHourlyData({ start: '', end: '' }); setSelectedPackage(null); setDurationLabel('Select Hours'); }}
                                className={`flex-1 py-2 text-xs font-bold tracking-widest rounded-md booking-type-btn ${bookingType === 'hourly' ? 'active' : 'text-zinc-500 hover:text-white'}`}
                            >
                                HOURLY RENTAL
                            </button>
                        </div>

                        <form onSubmit={handleBooking} className="space-y-6">

                            {/* DAILY MODE */}
                            {bookingType === 'daily' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-cyan-500 tracking-widest block mb-2">PICK-UP DATE</label>
                                        <input
                                            type="date"
                                            name="start"
                                            value={dailyDates.start}
                                            onChange={handleDailyChange}
                                            className="w-full p-3 rounded-lg input-field text-sm font-mono"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-cyan-500 tracking-widest block mb-2">DROP-OFF DATE</label>
                                        <input
                                            type="date"
                                            name="end"
                                            value={dailyDates.end}
                                            onChange={handleDailyChange}
                                            min={dailyDates.start}
                                            className="w-full p-3 rounded-lg input-field text-sm font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* HOURLY MODE */}
                            {bookingType === 'hourly' && (
                                <div className="space-y-6">

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Pick-up Time Input */}
                                        <div>
                                            <label className="text-[10px] font-bold text-cyan-500 tracking-widest block mb-2">PICK-UP TIME</label>
                                            <div className="relative">
                                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                                <input
                                                    type="time"
                                                    name="start"
                                                    value={hourlyData.start}
                                                    onChange={handleHourlyInputChange}
                                                    className="w-full p-3 pl-10 rounded-lg input-field text-sm font-mono"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* End Time Input (Auto Calculated) */}
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 tracking-widest block mb-2">DROP-OFF TIME</label>
                                            <div className="relative">
                                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                                <input
                                                    type="time"
                                                    name="end"
                                                    value={hourlyData.end}
                                                    readOnly
                                                    className="w-full p-3 pl-10 rounded-lg input-field input-disabled text-sm font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hourly Packages Buttons */}
                                    <div>
                                        <label className="text-[10px] font-bold text-cyan-500 tracking-widest block mb-2">SELECT DURATION</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {hourlyPackages.map((pkg) => (
                                                <div
                                                    key={pkg.hours}
                                                    onClick={() => handlePackageSelect(pkg)}
                                                    className={`hourly-card p-3 rounded-xl text-center ${selectedPackage?.hours === pkg.hours ? 'selected' : ''}`}
                                                >
                                                    <span className="block text-lg font-black text-white">{pkg.hours}H</span>
                                                    <span className="text-xs text-zinc-400 font-mono">₹{pkg.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PRICING SUMMARY */}
                            <div className="p-6 bg-cyan-900/10 rounded-xl border border-cyan-500/30 mt-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-zinc-400">Duration</span>
                                    <span className="text-white font-bold">{durationLabel}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-zinc-400">Plan</span>
                                    <span className="text-white font-bold uppercase">{bookingType === 'daily' ? 'Daily Rate' : 'Hourly Package'}</span>
                                </div>
                                <div className="h-px w-full bg-cyan-500/30 my-3"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-cyan-400 uppercase tracking-widest">Total Pay</span>
                                    <span className="text-2xl font-black text-white">${totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || totalPrice <= 0}
                                className={`w-full py-4 rounded-xl font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${loading || totalPrice <= 0
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-cyan-600 text-black hover:bg-cyan-400 shadow-cyan-500/30'
                                    }`}
                            >
                                {loading ? 'PROCESSING...' : 'CONFIRM BOOKING'} <CheckCircle size={16} />
                            </button>

                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default BookCar;