import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Lock, ShieldCheck, CheckCircle, AlertCircle, ArrowRight, ChevronLeft, Activity, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AdminResetPassword = () => {
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    adminname: "",
    otp: "",
    newPassword: "",
    confirmpassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [customAlert, setCustomAlert] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeAlert = () => {
    setCustomAlert({ ...customAlert, show: false });
    if (customAlert.type === 'success') {
      navigate("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmpassword) {
      setCustomAlert({
        show: true,
        type: 'warning',
        title: 'MISMATCH ERROR',
        message: "Passwords do not match. Please verify."
      });
      return;
    }

    if (!formData.adminname || !formData.otp) {
      setCustomAlert({
        show: true,
        type: 'warning',
        title: 'MISSING DATA',
        message: "Please enter Admin Name and OTP."
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API}/admin/reset-password`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      // 3. Success
      setCustomAlert({
        show: true,
        type: 'success',
        title: 'RESET SUCCESSFUL',
        message: res.data.message || "Password reset successful!"
      });

      setFormData({ adminname: "", otp: "", newPassword: "", confirmpassword: "" });

    } catch (error) {
      console.error("Reset Password Error:", error);

      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "Server Error";

      if (status === 404) {
        setCustomAlert({ show: true, type: 'error', title: 'NOT FOUND', message: "Admin not found with this username." });
      } else if (status === 400) {
        setCustomAlert({ show: true, type: 'warning', title: 'INVALID INPUT', message: errorMessage });
      } else {
        setCustomAlert({ show: true, type: 'error', title: 'SYSTEM ERROR', message: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
  };

  const formVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.5 }
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col lg:flex-row overflow-hidden selection:bg-red-500 selection:text-black relative font-sans">

      {/* CUSTOM ALERT POPUP  */}
      <AnimatePresence>
        {customAlert.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative w-full max-w-md p-8 rounded-2xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center overflow-hidden ${customAlert.type === 'success' ? 'bg-zinc-900 border-green-500 shadow-green-500/20' :
                customAlert.type === 'warning' ? 'bg-zinc-900 border-yellow-500 shadow-yellow-500/20' :
                  'bg-zinc-900 border-red-500 shadow-red-500/20'
                }`}
            >
              {/* Inner Glow */}
              <div className={`absolute inset-0 opacity-10 ${customAlert.type === 'success' ? 'bg-green-500' :
                customAlert.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />

              {/* Icon */}
              <div className="relative z-10 mb-4 flex justify-center">
                {customAlert.type === 'success' ? <CheckCircle size={64} className="text-green-500" /> :
                  customAlert.type === 'warning' ? <ShieldCheck size={64} className="text-yellow-500" /> :
                    <AlertCircle size={64} className="text-red-500" />}
              </div>

              {/* Content */}
              <h2 className={`relative z-10 text-2xl font-black uppercase italic tracking-wider mb-2 ${customAlert.type === 'success' ? 'text-green-500' :
                customAlert.type === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                {customAlert.title}
              </h2>

              <p className="relative z-10 text-zinc-300 font-mono text-sm mb-8">
                {customAlert.message}
              </p>

              {/* Close Button */}
              <button
                onClick={closeAlert}
                className={`relative z-10 px-8 py-3 rounded-lg font-bold tracking-widest text-black uppercase transition-transform active:scale-95 ${customAlert.type === 'success' ? 'bg-green-500 hover:bg-green-400' :
                  customAlert.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-red-500 hover:bg-red-400'
                  }`}
              >
                {customAlert.type === 'success' ? 'CONTINUE' : 'RETRY'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= LEFT SIDE: CINEMATIC VISUAL ================= */}
      <div className="relative w-full lg:w-[60%] h-[40vh] lg:h-screen overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600712242805-5f786710d421?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[3s] ease-in-out scale-105 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-8 lg:bottom-20 lg:left-20 p-6 backdrop-blur-md bg-black/30 border-l-4 border-red-500 rounded-r-xl"
        >
          <h1 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter italic">
            Secure<span className="text-red-500">Reset</span>
          </h1>
          <p className="text-gray-300 mt-2 text-sm lg:text-base max-w-md hidden sm:block">
            Finalizing security protocols. Enter your OTP to establish new command credentials.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs font-mono text-red-500">
            <Activity size={14} className="animate-pulse" />
            <span>SECURE CHANNEL</span>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: FORM  */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 relative z-10 bg-black"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <motion.div variants={formVariants} className="w-full max-w-md relative z-20">

          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-xl mb-4 text-red-500 border border-red-500/20">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-semibold tracking-wide">Set New Password</h2>
            <p className="text-zinc-500 text-sm mt-1">Enter details to secure your account.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Added: Admin Name Input */}
            <div className="relative">
              <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all duration-300 ${focusedField === 'adminname' ? 'text-red-500' : 'text-zinc-500'}`}>
                ADMIN USERNAME
              </label>
              <div className={`flex items-center border-b-2 py-3 transition-all duration-300 ${focusedField === 'adminname' ? 'border-red-500 bg-red-500/5' : 'border-zinc-800'}`}>
                <User size={20} className={`mr-3 transition-colors ${focusedField === 'adminname' ? 'text-red-500' : 'text-zinc-600'}`} />
                <input
                  type="text"
                  name="adminname"
                  value={formData.adminname}
                  onChange={handleInput}
                  placeholder="Enter your username"
                  className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm tracking-widest"
                  onFocus={() => setFocusedField('adminname')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* OTP Input */}
            <div className="relative mt-8">
              <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all duration-300 ${focusedField === 'otp' ? 'text-red-500' : 'text-zinc-500'}`}>
                ONE-TIME PASSWORD
              </label>
              <div className={`flex items-center border-b-2 py-3 transition-all duration-300 ${focusedField === 'otp' ? 'border-red-500 bg-red-500/5' : 'border-zinc-800'}`}>
                <KeyRound size={20} className={`mr-3 transition-colors ${focusedField === 'otp' ? 'text-red-500' : 'text-zinc-600'}`} />
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInput}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm tracking-widest"
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* New Password Input */}
            <div className="relative mt-8">
              <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all duration-300 ${focusedField === 'newPassword' ? 'text-red-500' : 'text-zinc-500'}`}>
                NEW PASSWORD
              </label>
              <div className={`flex items-center border-b-2 py-3 transition-all duration-300 ${focusedField === 'newPassword' ? 'border-red-500 bg-red-500/5' : 'border-zinc-800'}`}>
                <Lock size={20} className={`mr-3 transition-colors ${focusedField === 'newPassword' ? 'text-red-500' : 'text-zinc-600'}`} />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInput}
                  placeholder="Create strong password"
                  className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="relative mt-8">
              <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all duration-300 ${focusedField === 'confirmpassword' ? 'text-red-500' : 'text-zinc-500'}`}>
                CONFIRM PASSWORD
              </label>
              <div className={`flex items-center border-b-2 py-3 transition-all duration-300 ${focusedField === 'confirmpassword' ? 'border-red-500 bg-red-500/5' : 'border-zinc-800'}`}>
                <ShieldCheck size={20} className={`mr-3 transition-colors ${focusedField === 'confirmpassword' ? 'text-red-500' : 'text-zinc-600'}`} />
                <input
                  type="password"
                  name="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleInput}
                  placeholder="Repeat password"
                  className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                  onFocus={() => setFocusedField('confirmpassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`w-full group relative overflow-hidden bg-white text-black font-bold py-4 px-6 rounded-lg mt-8 flex items-center justify-between ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="relative z-10 tracking-widest">
                {isLoading ? 'UPDATING...' : 'RESET PASSWORD'}
              </span>
              <div className="relative z-10 bg-black text-white p-1 rounded-md group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>

              {/* Hover Fill Effect (Red) */}
              <div className="absolute inset-0 bg-red-600 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            </motion.button>

          </form>

          {/* Footer Links */}
          <div className="mt-8 flex justify-center items-center gap-4 text-xs font-mono">
            <Link to="/admin/forgot-password" className="text-zinc-500 hover:text-red-500 flex items-center gap-1 transition-colors">
              <ChevronLeft size={14} /> BACK TO GET OTP
            </Link>
          </div>

        </motion.div>

        {/* Decorative Tech Circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

    </div>
  );
};

export default AdminResetPassword;