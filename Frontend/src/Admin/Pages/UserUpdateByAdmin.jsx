import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, CreditCard, Shield, CheckCircle, XCircle,
    ChevronLeft, Edit2, Key, Car, X, AlertCircle
} from 'lucide-react';

//  Styles Reuse (Kept exactly as requested)
const styles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .glass-input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }
  .glass-input:focus {
    border-color: #06b6d4; /* cyan-500 */
    outline: none;
  }
  
  /* Custom scrollbar for the modal content only */
  .custom-scroll::-webkit-scrollbar {
      width: 4px;
  }
  .custom-scroll::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.3);
  }
  .custom-scroll::-webkit-scrollbar-thumb {
      background: #333;
      border-radius: 2px;
  }
`;

const UserDetails = () => {
    const { id } = useParams(); // Get user ID from URL
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // --- NEW: Custom Alert State ---
    const [customAlert, setCustomAlert] = useState({
        show: false,
        type: 'success', // 'success' or 'error'
        title: '',
        message: ''
    });

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        cardverify: false,
        verify: false
    });

    const API = import.meta.env.VITE_BACKEND_URL;

    // Helper to close alert
    const closeAlert = () => {
        setCustomAlert({ ...customAlert, show: false });
    };

    //  Fetch User Data 
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await axios.get(`${API}/admin/user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && res.data.user) {
                    const u = res.data.user;
                    setUser(u);
                    setFormData({
                        username: u.username || '',
                        email: u.email || '',
                        password: '',
                        cardverify: u.cardverify || false,
                        verify: u.verify || false
                    });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                // Replaced alert with Custom Alert
                setCustomAlert({
                    show: true,
                    type: 'error',
                    title: 'FETCH ERROR',
                    message: "Could not fetch user data. Check console."
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, API]);

    //  Handle Update 
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("adminToken");

            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            const res = await axios.put(
                `${API}/admin/user-update-by-admin/${id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.status === 200) {
                setUser(prev => ({ ...prev, ...formData, password: prev.password }));
                setIsEditOpen(false);
                
                // Replaced alert with Custom Alert
                setCustomAlert({
                    show: true,
                    type: 'success',
                    title: 'UPDATE SUCCESSFUL',
                    message: "User profile has been updated successfully."
                });
            }
        } catch (error) {
            console.error("Update failed:", error);
            // Replaced alert with Custom Alert
            setCustomAlert({
                show: true,
                type: 'error',
                title: 'UPDATE FAILED',
                message: error.response?.data?.message || "Failed to update user."
            });
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono animate-pulse">LOADING USER DATA...</div>;
    if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono">USER NOT FOUND</div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans pt-8 pb-20 relative overflow-x-hidden">
            <style>{styles}</style>

            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:40px_40px] pointer-events-none z-0" />

            {/* ================= NEW CUSTOM ALERT POPUP ================= */}
            <AnimatePresence>
                {customAlert.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`relative w-full max-w-md p-8 rounded-2xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center overflow-hidden ${customAlert.type === 'success' ? 'bg-zinc-900 border-cyan-500 shadow-cyan-500/20' : 'bg-zinc-900 border-red-500 shadow-red-500/20'}`}
                        >
                            {/* Alert Inner Glow */}
                            <div className={`absolute inset-0 opacity-10 ${customAlert.type === 'success' ? 'bg-cyan-500' : 'bg-red-500'}`} />

                            {/* Icon */}
                            <div className="relative z-10 mb-4 flex justify-center">
                                {customAlert.type === 'success' ? (
                                    <CheckCircle size={64} className="text-cyan-500" />
                                ) : (
                                    <AlertCircle size={64} className="text-red-500" />
                                )}
                            </div>

                            {/* Content */}
                            <h2 className={`relative z-10 text-2xl font-black uppercase italic tracking-wider mb-2 ${customAlert.type === 'success' ? 'text-cyan-500' : 'text-red-500'}`}>
                                {customAlert.title}
                            </h2>
                            <p className="relative z-10 text-zinc-300 font-mono text-sm mb-8">
                                {customAlert.message}
                            </p>

                            {/* Close Button */}
                            <button
                                onClick={closeAlert}
                                className={`relative z-10 px-8 py-3 rounded-lg font-bold tracking-widest text-black uppercase transition-transform active:scale-95 ${customAlert.type === 'success' ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-500 hover:bg-red-400'}`}
                            >
                                {customAlert.type === 'success' ? 'CONTINUE' : 'CLOSE'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ================= END ALERT ================= */}


            {/* Main Content  */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Nav Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <span className="text-cyan-500 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase block mb-1">Admin Control</span>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">User <span className="text-zinc-500">Profile</span></h1>
                    </div>
                </div>

                {/* Top Section: Profile Card & Quick Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

                    {/* 1. Identity Card */}
                    <div className="xl:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start relative overflow-hidden text-center md:text-left">
                        <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-zinc-700 group-hover:border-cyan-500 transition-colors shadow-2xl">
                                <img
                                    src={user.profileImage || "https://via.placeholder.com/150"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Status Dot */}
                            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-black ${user.verify ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 break-all">{user.username}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-zinc-400 font-mono text-xs sm:text-sm">
                                        <span className="text-cyan-600">ID:</span> <span className="break-all">{user._id}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                                >
                                    <Edit2 size={14} /> <span className="hidden sm:inline">Edit User</span><span className="sm:hidden">Edit</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-left">
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                        <Mail size={12} /> Email
                                    </div>
                                    <div className="text-zinc-200 text-sm truncate">{user.email}</div>
                                </div>

                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 relative group cursor-default text-left">
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                        <Key size={12} /> Password
                                    </div>
                                    <div className="text-zinc-200 font-mono tracking-widest blur-[4px] group-hover:blur-none transition-all duration-300 text-sm">
                                        ●●●●●●●●●●●●
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Verification Status Panel */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-center gap-4">
                        <h3 className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-2 text-center xl:text-left">Verifications</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                            {/* Email Status */}
                            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Shield size={18} className={user.verify ? "text-green-500" : "text-zinc-600"} />
                                    <span className="text-sm font-medium">Account</span>
                                </div>
                                {user.verify ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}
                            </div>

                            {/* Card Status */}
                            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={18} className={user.cardverify ? "text-cyan-500" : "text-zinc-600"} />
                                    <span className="text-sm font-medium">Document</span>
                                </div>
                                {user.cardverify ? <CheckCircle size={18} className="text-cyan-500" /> : <XCircle size={18} className="text-zinc-600" />}
                            </div>
                        </div>

                        {user.card && (
                            <div className="mt-2 px-2 flex justify-center items-center flex-col">
                                <div className="text-[10px] text-zinc-500 uppercase mb-2">Attached Document</div>
                                <div className="w-full h-40 rounded-lg overflow-hidden border border-zinc-800 bg-black/40 flex items-center justify-center group">
                                    <img
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                        src={user.card}
                                        alt="Verification Document"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Cars / Bookings */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Car className="text-cyan-500" />
                        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">Vehicle History</h2>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-400 border border-zinc-700">{user.cars?.length || 0}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {user.cars && user.cars.length > 0 ? (
                            user.cars.map((car, idx) => (
                                <div key={idx} className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 border-l-4 border-l-zinc-700 hover:border-l-cyan-500 transition-all">
                                    {/* Car Image - Bigger on Mobile */}
                                    <div className="w-full md:w-32 h-40 md:h-24 bg-zinc-900 rounded-lg overflow-hidden shrink-0 relative">
                                        <img src={car.carImage} alt={car.carName} className="w-full h-full object-cover opacity-90" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                                        <div className="absolute bottom-2 left-2 text-white font-bold md:hidden text-lg">{car.carName}</div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                        <div className="hidden md:block">
                                            <div className="text-[10px] text-zinc-500 uppercase">Vehicle</div>
                                            <div className="font-bold text-white text-sm sm:text-base">{car.carName}</div>
                                            <div className="text-xs text-zinc-400 font-mono">{car.carNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Price</div>
                                            <div className="font-mono text-cyan-400 text-sm sm:text-base">${car.price}</div>
                                            <div className="md:hidden text-xs text-zinc-400 font-mono mt-1">{car.carNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Timing</div>
                                            <div className="text-xs sm:text-sm text-zinc-300">{car.startTime?.slice(0, 10)}</div>
                                            <div className="text-[10px] text-zinc-500">to {car.endTime?.slice(0, 10)}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Status</div>
                                            <span className={`inline-block px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase mt-1 ${car.status === 'completed' ? 'text-green-400 bg-green-900/20 border border-green-900/50' :
                                                car.status === 'cancelled' ? 'text-red-400 bg-red-900/20 border border-red-900/50' :
                                                    'text-cyan-400 bg-cyan-900/20 border border-cyan-900/50'
                                                }`}>
                                                {car.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-mono text-sm bg-zinc-900/20">
                                No vehicle history found for this user.
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* REFINED & RESPONSIVE EDIT MODAL  */}
            <AnimatePresence>
                {isEditOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />

                        <motion.div
                            initial={{ scale: 0.95, y: 100, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 100, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full sm:max-w-xl max-h-[90vh] bg-[#09090b] sm:rounded-3xl rounded-t-3xl border-t sm:border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col"
                        >
                            {/* Decorative Top Line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                            {/* Scrollable Content Container */}
                            <div className="overflow-y-auto custom-scroll p-6 sm:p-8">

                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                                            Edit <span className="text-cyan-500">Profile</span>
                                        </h3>
                                        <p className="text-xs text-zinc-500 font-mono mt-1">UPDATE CREDENTIALS & PERMISSIONS</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditOpen(false)}
                                        className="p-2 rounded-full bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors border border-zinc-800"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateSubmit} className="space-y-6">

                                    {/* Inputs Grid */}
                                    <div className="space-y-5">
                                        <div className="group">
                                            <label className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest mb-2 block">Username</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:border-cyan-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                                                    placeholder="Enter username"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest mb-2 block">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:border-cyan-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                                                    placeholder="Enter email address"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest mb-2 block flex justify-between">
                                                <span>New Password</span>
                                                <span className="text-zinc-600 font-normal lowercase tracking-normal">optional</span>
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                                                <input
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:border-cyan-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                                                    placeholder="••••••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Toggles - Grid Layout */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        {/* Account Verify Toggle */}
                                        <div
                                            onClick={() => setFormData({ ...formData, verify: !formData.verify })}
                                            className={`cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all duration-300 active:scale-95 ${formData.verify ? 'bg-green-950/20 border-green-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <div className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                                                <div className={`p-2.5 rounded-full transition-colors duration-300 ${formData.verify ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    <Shield size={20} />
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.verify ? 'text-green-400' : 'text-zinc-500'}`}>
                                                    Account Verified
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${formData.verify ? 'bg-green-500 animate-pulse' : 'bg-zinc-800'}`} />
                                            </div>
                                        </div>

                                        {/* Card Verify Toggle */}
                                        <div
                                            onClick={() => setFormData({ ...formData, cardverify: !formData.cardverify })}
                                            className={`cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all duration-300 active:scale-95 ${formData.cardverify ? 'bg-cyan-950/20 border-cyan-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <div className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                                                <div className={`p-2.5 rounded-full transition-colors duration-300 ${formData.cardverify ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.cardverify ? 'text-cyan-400' : 'text-zinc-500'}`}>
                                                    Doc Verified
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${formData.cardverify ? 'bg-cyan-500 animate-pulse' : 'bg-zinc-800'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditOpen(false)}
                                            className="flex-1 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest border border-zinc-800 transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 transition-all transform active:scale-95"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default UserDetails;