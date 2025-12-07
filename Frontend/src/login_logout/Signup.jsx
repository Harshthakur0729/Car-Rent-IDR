import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Activity, Hexagon, ChevronLeft, CheckCircle, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CarSignup = () => {
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_BACKEND_URL;

  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [otp, setOtp] = useState("");
  const [hide, setHide] = useState(false);
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

  const handleOTP = (e) => {
    setOtp(e.target.value);
  };

  const closeAlert = () => {
    setCustomAlert({ ...customAlert, show: false });
    if (customAlert.title === 'VERIFICATION COMPLETE') {
      navigate("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(userDetails).some((val) => !val)) {
      setCustomAlert({
        show: true,
        type: 'error',
        title: 'MISSING DATA',
        message: "All fields are required to initialize registration."
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API}/user/sign-up`, userDetails, {});
      setHide(true);
      setCustomAlert({
        show: true,
        type: 'success',
        title: 'OTP SENT',
        message: res.data.message || "Verification code sent to your email."
      });

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Failed to send OTP. Network jammed.";
      setCustomAlert({
        show: true,
        type: 'error',
        title: 'TRANSMISSION ERROR',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const emailVerification = async (e) => {
    e.preventDefault();

    if (!otp) {
      setCustomAlert({
        show: true,
        type: 'error',
        title: 'INPUT REQUIRED',
        message: "Please enter the OTP security code."
      });
      return;
    }

    setIsLoading(true);

    try {

      const res = await axios.post(`${API}/user/verify-otp`, { otp, email: userDetails.email }, {});

      setCustomAlert({
        show: true,
        type: 'success',
        title: 'VERIFICATION COMPLETE',
        message: res.data.message || "Email verified successfully. Welcome to the crew."
      });

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "OTP verification failed.";
      setCustomAlert({
        show: true,
        type: 'error',
        title: 'ACCESS DENIED',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
  };

  const formVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    },
    exit: { x: 50, opacity: 0 }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col lg:flex-row-reverse overflow-hidden selection:bg-cyan-500 selection:text-black relative font-sans">

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
              className={`relative w-full max-w-md p-8 rounded-2xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center overflow-hidden ${customAlert.type === 'success' ? 'bg-zinc-900 border-cyan-500 shadow-cyan-500/20' : 'bg-zinc-900 border-red-500 shadow-red-500/20'}`}
            >

              <div className={`absolute inset-0 opacity-10 ${customAlert.type === 'success' ? 'bg-cyan-500' : 'bg-red-500'}`} />

              <div className="relative z-10 mb-4 flex justify-center">
                {customAlert.type === 'success' ?
                  <CheckCircle size={64} className="text-cyan-500" /> :
                  <AlertCircle size={64} className="text-red-500" />
                }
              </div>

              <h2 className={`relative z-10 text-2xl font-black uppercase italic tracking-wider mb-2 ${customAlert.type === 'success' ? 'text-cyan-500' : 'text-red-500'}`}>
                {customAlert.title}
              </h2>
              <p className="relative z-10 text-zinc-300 font-mono text-sm mb-8">
                {customAlert.message}
              </p>

              <button
                onClick={closeAlert}
                className={`relative z-10 px-8 py-3 rounded-lg font-bold tracking-widest text-black uppercase transition-transform active:scale-95 ${customAlert.type === 'success' ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-500 hover:bg-red-400'}`}
              >
                {customAlert.type === 'success' ? 'ACKNOWLEDGE' : 'RETRY'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="relative w-full lg:w-[60%] h-[40vh] lg:h-screen overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[3s] ease-in-out scale-105 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-black/20 lg:to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 right-8 lg:bottom-20 lg:right-20 p-6 backdrop-blur-md bg-black/30 border-r-4 border-cyan-400 rounded-l-xl text-right"
        >
          <h1 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter italic">
            Join<span className="text-cyan-400">TheCrew</span>
          </h1>
          <p className="text-gray-300 mt-2 text-sm lg:text-base max-w-md ml-auto hidden sm:block">
            Unlock the full potential of your machine. Register now to track performance and telemetry.
          </p>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs font-mono text-cyan-400">
            <span>{hide ? "SECURITY CHECK" : "REGISTRATION OPEN"}</span>
            <Activity size={14} className="animate-pulse" />
          </div>
        </motion.div>
      </div>


      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 relative z-10 bg-black"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="w-full max-w-md relative z-20">


          {!hide && (
            <Link to="/login" className="inline-flex items-center text-zinc-500 hover:text-cyan-400 text-xs font-mono mb-8 transition-colors">
              <ChevronLeft size={14} className="mr-1" />
              BACK TO LOGIN
            </Link>
          )}


          <div className="mb-10 text-center lg:text-left">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 border ${hide ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
              {hide ? <ShieldCheck size={24} /> : <Hexagon size={24} />}
            </div>
            <h2 className="text-2xl font-semibold tracking-wide">
              {hide ? "Security Verification" : "New Pilot Registration"}
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              {hide ? "Enter the code sent to your comms channel." : "Create your secure driver profile."}
            </p>
          </div>

          <AnimatePresence mode='wait'>
            {!hide ? (

              <motion.form
                key="signup-form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Username */}
                <div className="relative">
                  <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all ${focusedField === 'username' ? 'text-cyan-400' : 'text-zinc-500'}`}>
                    USERNAME
                  </label>
                  <div className={`flex items-center border-b-2 py-3 transition-all ${focusedField === 'username' ? 'border-cyan-400 bg-cyan-400/5' : 'border-zinc-800'}`}>
                    <User size={20} className={`mr-3 ${focusedField === 'username' ? 'text-cyan-400' : 'text-zinc-600'}`} />
                    <input
                      type="text"
                      name="username"
                      value={userDetails.username}
                      onChange={handleInput}
                      placeholder="Enter Username"
                      className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative mt-8">
                  <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all ${focusedField === 'email' ? 'text-cyan-400' : 'text-zinc-500'}`}>
                    EMAIL ADDRESS
                  </label>
                  <div className={`flex items-center border-b-2 py-3 transition-all ${focusedField === 'email' ? 'border-cyan-400 bg-cyan-400/5' : 'border-zinc-800'}`}>
                    <Mail size={20} className={`mr-3 ${focusedField === 'email' ? 'text-cyan-400' : 'text-zinc-600'}`} />
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

                {/* Password */}
                <div className="relative mt-8">
                  <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all ${focusedField === 'password' ? 'text-cyan-400' : 'text-zinc-500'}`}>
                    PASSWORD
                  </label>
                  <div className={`flex items-center border-b-2 py-3 transition-all ${focusedField === 'password' ? 'border-cyan-400 bg-cyan-400/5' : 'border-zinc-800'}`}>
                    <Lock size={20} className={`mr-3 ${focusedField === 'password' ? 'text-cyan-400' : 'text-zinc-600'}`} />
                    <input
                      type="password"
                      name="password"
                      value={userDetails.password}
                      onChange={handleInput}
                      placeholder="Create Strong Key"
                      className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                      onFocus={() => setFocusedField('password')}
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
                    {isLoading ? 'INITIATING...' : 'GET OTP CODE'}
                  </span>
                  <div className="relative z-10 bg-black text-white p-1 rounded-md group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                  </div>
                  <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </motion.button>

              </motion.form>
            ) : (
              /* STEP 2: OTP VERIFICATION FORM  */
              <motion.form
                key="otp-form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={emailVerification}
                className="space-y-6"
              >
                <div className="relative">
                  <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all ${focusedField === 'otp' ? 'text-green-400' : 'text-zinc-500'}`}>
                    ONE-TIME PASSWORD
                  </label>
                  <div className={`flex items-center border-b-2 py-3 transition-all ${focusedField === 'otp' ? 'border-green-400 bg-green-400/5' : 'border-zinc-800'}`}>
                    <KeyRound size={20} className={`mr-3 ${focusedField === 'otp' ? 'text-green-400' : 'text-zinc-600'}`} />
                    <input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={handleOTP}
                      placeholder="Enter 6-digit code"
                      className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm tracking-widest"
                      onFocus={() => setFocusedField('otp')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono mt-2">
                  <span className="text-zinc-500">Check your email inbox.</span>
                  <button type="button" onClick={() => setHide(false)} className="text-cyan-400 hover:underline">Wrong Email?</button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className={`w-full group relative overflow-hidden bg-white text-black font-bold py-4 px-6 rounded-lg mt-8 flex items-center justify-between ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className="relative z-10 tracking-widest">
                    {isLoading ? 'VERIFYING...' : 'VERIFY & LAUNCH'}
                  </span>
                  <div className="relative z-10 bg-black text-white p-1 rounded-md group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                  </div>
                  <div className="absolute inset-0 bg-green-500 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </motion.button>

              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          {!hide && (
            <div className="mt-8 text-center">
              <p className="text-zinc-600 text-xs font-mono">
                Already have an ID? <Link to="/login" className="text-cyan-400 hover:underline font-bold ml-1">LOGIN HERE</Link>
              </p>
            </div>
          )}

        </div>

        {/* Decorative Tech Circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

    </div>
  );
};

export default CarSignup;