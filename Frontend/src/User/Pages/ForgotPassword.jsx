import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Activity, Hexagon, ChevronLeft, CheckCircle, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const UserForgotPassword = () => {
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_BACKEND_URL;
  const [userDetails, setUserDetails] = useState({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });


  const handleInput = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const closeAlert = () => {
    setCustomAlert({ ...customAlert, show: false });
    if (customAlert.type === 'success') {
      navigate("/reset-password");
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API}/user/forget-password`,
        userDetails,
        { withCredentials: true }
      );

      console.log("OTP sent:", res.data);

      setCustomAlert({
        show: true,
        type: 'success',
        title: 'OTP SENT',
        message: res.data.message || "OTP sent to your email successfully!"
      });

    } catch (error) {
      console.error("OTP failed:", error);

      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "Invalid credentials or server issue.";

      if (status === 404) {
        setCustomAlert({
          show: true,
          type: 'warning',
          title: 'EMAIL NOT FOUND',
          message: errorMessage
        });
      } else {
        setCustomAlert({
          show: true,
          type: 'error',
          title: 'CONNECTION ERROR',
          message: errorMessage
        });
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
    <div className="min-h-screen w-full bg-black text-white flex flex-col lg:flex-row overflow-hidden selection:bg-cyan-500 selection:text-black relative font-sans">

      {/*  CUSTOM ALERT POPUP  */}
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
              className={`relative w-full max-w-md p-8 rounded-2xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center overflow-hidden ${customAlert.type === 'success' ? 'bg-zinc-900 border-cyan-500 shadow-cyan-500/20' :
                  customAlert.type === 'warning' ? 'bg-zinc-900 border-yellow-500 shadow-yellow-500/20' :
                    'bg-zinc-900 border-red-500 shadow-red-500/20'
                }`}
            >
              {/* Inner Glow */}
              <div className={`absolute inset-0 opacity-10 ${customAlert.type === 'success' ? 'bg-cyan-500' :
                  customAlert.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />

              {/* Icon */}
              <div className="relative z-10 mb-4 flex justify-center">
                {customAlert.type === 'success' ? <CheckCircle size={64} className="text-cyan-500" /> :
                  customAlert.type === 'warning' ? <ShieldCheck size={64} className="text-yellow-500" /> :
                    <AlertCircle size={64} className="text-red-500" />}
              </div>

              {/* Title */}
              <h2 className={`relative z-10 text-2xl font-black uppercase italic tracking-wider mb-2 ${customAlert.type === 'success' ? 'text-cyan-500' :
                  customAlert.type === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                {customAlert.title}
              </h2>

              {/* Message */}
              <p className="relative z-10 text-zinc-300 font-mono text-sm mb-8">
                {customAlert.message}
              </p>

              {/* Close Button */}
              <button
                onClick={closeAlert}
                className={`relative z-10 px-8 py-3 rounded-lg font-bold tracking-widest text-black uppercase transition-transform active:scale-95 ${customAlert.type === 'success' ? 'bg-cyan-500 hover:bg-cyan-400' :
                    customAlert.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-red-500 hover:bg-red-400'
                  }`}
              >
                {customAlert.type === 'success' ? 'PROCEED' : 'RETRY'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  LEFT SIDE: CINEMATIC VISUAL  */}
      <div className="relative w-full lg:w-[60%] h-[40vh] lg:h-screen overflow-hidden group">
        {/* Background Image (Cyan Theme for User) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[3s] ease-in-out scale-105 group-hover:scale-110" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-8 lg:bottom-20 lg:left-20 p-6 backdrop-blur-md bg-black/30 border-l-4 border-cyan-400 rounded-r-xl"
        >
          <h1 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter italic">
            Restore<span className="text-cyan-400">Access</span>
          </h1>
          <p className="text-gray-300 mt-2 text-sm lg:text-base max-w-md hidden sm:block">
            Secure your cockpit. Establish new credentials to regain full telemetry control.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs font-mono text-cyan-400">
            <Activity size={14} className="animate-pulse" />
            <span>ENCRYPTION ACTIVE</span>
          </div>
        </motion.div>
      </div>

      {/*  RIGHT SIDE: FORM  */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 relative z-10 bg-black"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <motion.div variants={formVariants} className="w-full max-w-md relative z-20">

          {/* Back Link */}
          <Link to="/login" className="inline-flex items-center text-zinc-500 hover:text-cyan-400 text-xs font-mono mb-8 transition-colors">
            <ChevronLeft size={14} className="mr-1" />
            BACK TO LOGIN
          </Link>

          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-xl mb-4 text-cyan-400 border border-cyan-500/20">
              <KeyRound size={24} />
            </div>
            <h2 className="text-2xl font-semibold tracking-wide">Forgot Password?</h2>
            <p className="text-zinc-500 text-sm mt-1">Enter your registered email to receive OTP.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleForm} className="space-y-6">

            {/* Email Input */}
            <div className="relative">
              <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all duration-300 ${focusedField === 'email' ? 'text-cyan-400' : 'text-zinc-500'}`}>
                EMAIL ADDRESS
              </label>
              <div className={`flex items-center border-b-2 py-3 transition-all duration-300 ${focusedField === 'email' ? 'border-cyan-400 bg-cyan-400/5' : 'border-zinc-800'}`}>
                <Mail size={20} className={`mr-3 transition-colors ${focusedField === 'email' ? 'text-cyan-400' : 'text-zinc-600'}`} />
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInput}
                  placeholder="pilot@racetrack.com"
                  className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                  onFocus={() => setFocusedField('email')}
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
                {isLoading ? 'TRANSMITTING...' : 'SEND RECOVERY CODE'}
              </span>
              <div className="relative z-10 bg-black text-white p-1 rounded-md group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>

              {/* Hover Fill Effect (Cyan) */}
              <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            </motion.button>

          </form>

        </motion.div>

        {/* Decorative Tech Circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

    </div>
  );
};

export default UserForgotPassword;