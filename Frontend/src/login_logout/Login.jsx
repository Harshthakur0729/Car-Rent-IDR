import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Hexagon, Shield, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CarLogin = () => {
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const [role, setRole] = useState('user'); // 'user' or 'admin' toggler
  const [isLoading, setIsLoading] = useState(false);

  const [customAlert, setCustomAlert] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const [userDetails, setUserDetails] = useState({
    identifier: "",
    password: ""
  });

  const [adminDetails, setAdminDetails] = useState({
    adminname: "",
    password: ""
  });
  const API = import.meta.env.VITE_BACKEND_URL;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleInputAdmin = (e) => {
    const { name, value } = e.target;
    setAdminDetails(prev => ({ ...prev, [name]: value }));
  };

  const closeAlert = () => {
    setCustomAlert({ ...customAlert, show: false });

    if (customAlert.type === 'success') {
      if (role === 'admin') {
        navigate('/admin'); 
      } else {
        navigate('/');     
      }
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API}/user/login`,
        userDetails,
        { withCredentials: true }
      );

      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
      }

      setCustomAlert({
        show: true,
        type: 'success',
        title: 'ACCESS GRANTED',
        message: res.data.message || "Logged in successfully!"
      });

      setUserDetails({ identifier: "", password: "" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid credentials or server issue.";
      console.log(error);

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

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API}/admin/login`,
        adminDetails,
        { withCredentials: true }
      );
      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
      }

      setCustomAlert({
        show: true,
        type: 'success',
        title: 'COMMAND ACCESS GRANTED',
        message: res.data.message || "Admin logged in successfully!"
      });

      setAdminDetails({ adminname: "", password: "" });

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid credentials or server issue.";
      setCustomAlert({
        show: true,
        type: 'error',
        title: 'SECURITY BREACH',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterSubmit = (e) => {
    if (role === 'admin') {
      handleSubmitAdmin(e);
    } else {
      handleSubmitUser(e);
    }
  }

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
              className={`relative w-full max-w-md p-8 rounded-2xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center overflow-hidden ${customAlert.type === 'success' ? (role === 'admin' ? 'bg-zinc-900 border-red-500 shadow-red-500/20' : 'bg-zinc-900 border-cyan-500 shadow-cyan-500/20') : 'bg-zinc-900 border-yellow-500 shadow-yellow-500/20'}`}
            >
              {/* Alert Inner Glow */}
              <div className={`absolute inset-0 opacity-10 ${customAlert.type === 'success' ? (role === 'admin' ? 'bg-red-600' : 'bg-cyan-500') : 'bg-yellow-500'}`} />

              {/* Icon */}
              <div className="relative z-10 mb-4 flex justify-center">
                {customAlert.type === 'success' ? (
                  <CheckCircle size={64} className={role === 'admin' ? 'text-red-500' : 'text-cyan-500'} />
                ) : (
                  <AlertCircle size={64} className="text-yellow-500" />
                )}
              </div>

              {/* Content */}
              <h2 className={`relative z-10 text-2xl font-black uppercase italic tracking-wider mb-2 ${customAlert.type === 'success' ? (role === 'admin' ? 'text-red-500' : 'text-cyan-500') : 'text-yellow-500'}`}>
                {customAlert.title}
              </h2>
              <p className="relative z-10 text-zinc-300 font-mono text-sm mb-8">
                {customAlert.message}
              </p>

              {/* Close Button */}
              <button
                onClick={closeAlert}
                className={`relative z-10 px-8 py-3 rounded-lg font-bold tracking-widest text-black uppercase transition-transform active:scale-95 ${customAlert.type === 'success' ? (role === 'admin' ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-500 hover:bg-cyan-400') : 'bg-yellow-500 hover:bg-yellow-400'}`}
              >
                {customAlert.type === 'success' ? 'PROCEED' : 'RETRY'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/*  LEFT SIDE: CINEMATIC VISUAL  */}
      <div className="relative w-full lg:w-[60%] h-[40vh] lg:h-screen overflow-hidden group">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2787&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[3s] ease-in-out scale-105 group-hover:scale-110" />

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Floating Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-8 lg:bottom-20 lg:left-20 p-6 backdrop-blur-md bg-black/30 border-l-4 border-cyan-400 rounded-r-xl"
        >
          <h1 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter italic">
            Drift<span className="text-cyan-400">King</span>
          </h1>
          <p className="text-gray-300 mt-2 text-sm lg:text-base max-w-md hidden sm:block">
            Experience the ultimate driving machine. Login to access your telemetry data.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs font-mono text-cyan-400">
            <Activity size={14} className="animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
        </motion.div>
      </div>


      {/*  RIGHT SIDE: LOGIN FORM  */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 relative z-10 bg-black"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <motion.div variants={formVariants} className="w-full max-w-md relative z-20">

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 border transition-all duration-500 ${role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
              <Hexagon size={24} />
            </div>
            <h2 className="text-2xl font-semibold tracking-wide">
              {role === 'admin' ? 'Admin Portal' : 'Driver Login'}
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Enter credentials to initiate sequence.</p>
          </div>

          {/*  ROLE SWITCHER (User/Admin)  */}
          <div className="flex bg-zinc-900 p-1 rounded-lg mb-8 border border-zinc-800 relative overflow-hidden">
            <button
              onClick={() => setRole('user')}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold tracking-widest transition-all duration-300 z-10 ${role === 'user' ? 'text-white bg-cyan-600 shadow-[0_0_20px_rgba(8,145,178,0.5)]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <User size={14} /> USER
            </button>
            <button
              onClick={() => setRole('admin')}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold tracking-widest transition-all duration-300 z-10 ${role === 'admin' ? 'text-white bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Shield size={14} /> ADMIN
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleMasterSubmit} className="space-y-6">

            {/* Identifier Input (Username / Adminname) */}
            <div className="relative">
              <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all duration-300 ${focusedField === 'identifier' ? (role === 'admin' ? 'text-red-500' : 'text-cyan-400') : 'text-zinc-500'}`}>
                {role === 'admin' ? 'ADMIN NAME' : 'USERNAME'}
              </label>
              <div className={`flex items-center border-b-2 py-3 transition-all duration-300 ${focusedField === 'identifier' ? (role === 'admin' ? 'border-red-500 bg-red-500/5' : 'border-cyan-400 bg-cyan-400/5') : 'border-zinc-800'}`}>
                <User size={20} className={`mr-3 transition-colors ${focusedField === 'identifier' ? (role === 'admin' ? 'text-red-500' : 'text-cyan-400') : 'text-zinc-600'}`} />

                {/* CONDITIONAL INPUT RENDERING BASED ON ROLE */}
                {role === 'admin' ? (
                  <input
                    type="text"
                    name="adminname"
                    value={adminDetails.adminname}
                    onChange={handleInputAdmin}
                    placeholder="Enter Admin Name"
                    className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                    onFocus={() => setFocusedField('identifier')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    name="identifier"
                    value={userDetails.identifier}
                    onChange={handleInput}
                    placeholder="Enter Username or Email"
                    className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                    onFocus={() => setFocusedField('identifier')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="relative mt-8">
              <label className={`absolute left-0 -top-3 text-[10px] font-mono tracking-widest transition-all duration-300 ${focusedField === 'pass' ? (role === 'admin' ? 'text-red-500' : 'text-cyan-400') : 'text-zinc-500'}`}>
                PASSWORD
              </label>
              <div className={`flex items-center border-b-2 py-3 transition-all duration-300 ${focusedField === 'pass' ? (role === 'admin' ? 'border-red-500 bg-red-500/5' : 'border-cyan-400 bg-cyan-400/5') : 'border-zinc-800'}`}>
                <Lock size={20} className={`mr-3 transition-colors ${focusedField === 'pass' ? (role === 'admin' ? 'text-red-500' : 'text-cyan-400') : 'text-zinc-600'}`} />

                {/* CONDITIONAL PASSWORD INPUT RENDERING */}
                {role === 'admin' ? (
                  <input
                    type="password"
                    name="password"
                    value={adminDetails.password}
                    onChange={handleInputAdmin}
                    placeholder="Enter Password"
                    className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                    onFocus={() => setFocusedField('pass')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                ) : (
                  <input
                    type="password"
                    name="password"
                    value={userDetails.password}
                    onChange={handleInput}
                    placeholder="Enter Password"
                    className="w-full bg-transparent outline-none placeholder-zinc-700 font-mono text-sm"
                    onFocus={() => setFocusedField('pass')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                )}
              </div>
            </div>

            {/* Extra Links */}
            <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
              {role === 'user' && (
                <Link to="/sign-up" className="hover:text-cyan-400 transition-colors">CREATE ACCOUNT</Link>
              )}
              <Link to={role === 'admin' ? "/admin/forgot-password" : "/forgot-password"} className={`transition-colors ${role === 'admin' ? 'hover:text-red-400' : 'hover:text-cyan-400'} ml-auto`}>
                LOST KEY?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`w-full group relative overflow-hidden bg-white text-black font-bold py-4 px-6 rounded-lg mt-8 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="relative z-10 tracking-widest">
                {isLoading ? 'AUTHENTICATING...' : 'INITIATE START'}
              </span>
              <div className="relative z-10 bg-black text-white p-1 rounded-md group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>

              {/* Fill Effect */}
              <div className={`absolute inset-0 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out ${role === 'admin' ? 'bg-red-500' : 'bg-cyan-400'}`} />
            </motion.button>

          </form>

          {/* Footer */}
          <hr className="mt-12 pt-6 border-t border-zinc-900 flex justify-center space-x-6" />

        </motion.div>

        {/* Decorative Tech Circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

    </div>
  );
};

export default CarLogin;