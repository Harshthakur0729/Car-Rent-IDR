# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




















import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Edit, Camera, ShieldCheck, ShieldAlert, X, KeyRound, Upload, CheckCircle, AlertCircle, Crown, Activity } from 'lucide-react';
import Cookies from 'js-cookie';

// --- CUSTOM CSS ---
const profileStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 5, 5, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.2);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
  }

  .glass-modal {
    background: rgba(10, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.4);
    box-shadow: 0 0 50px rgba(220, 38, 38, 0.2);
  }

  .status-badge-main { background: rgba(220, 38, 38, 0.2); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.5); }
  .status-badge-sub { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.5); }
`;

const LuxuryAdminProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [customAlert, setCustomAlert] = useState({ show: false, type: 'success', title: '', message: '' });
  
  const [editData, setEditData] = useState({ 
    adminname: '', 
    email: '', 
    profileImage: '', 
    oldPassword: '', 
    newPassword: '' 
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // --- API CONFIGURATION ---
  // const API = import.meta.env.VITE_BACKEND_URL;
  const API = "http://localhost:5000"; 

  // --- FETCH ADMIN DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get("User_Token"); // Assuming same token key for admin
        
        // API Call
        const res = await axios.get(`${API}/admin/profile`, { 
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setAdminData(res.data.admin);
        setEditData({ 
          adminname: res.data.admin.adminname, 
          email: res.data.admin.email, 
          profileImage: res.data.admin.profileImage, 
          oldPassword: '', 
          newPassword: '' 
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response && (error.response.status === 401)) {
             navigate('/login'); 
             return;
        }
        // Mock Data for Preview if API fails
        const mockAdmin = {
          adminname: "Commander Shepard",
          email: "admin@driftos.com",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
          mainAccount: true, // Toggle this to test Sub-Admin view
          Isadmin: true
        };
        setAdminData(mockAdmin);
        setEditData({ ...mockAdmin, oldPassword: '', newPassword: '' });
      } finally { 
        setLoading(false); 
      }
    };
    fetchProfile();
  }, [navigate, API]);

  const closeAlert = () => {
    setCustomAlert({ ...customAlert, show: false });
  };

  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { 
        setSelectedFile(file); 
        setEditData({ ...editData, profileImage: URL.createObjectURL(file) }); 
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("adminname", editData.adminname); 
    formData.append("email", editData.email);
    
    if (selectedFile) formData.append("profileImage", selectedFile);
    
    if (editData.newPassword) { 
        formData.append("oldPassword", editData.oldPassword); 
        formData.append("newPassword", editData.newPassword); 
    }
    
    try {
        const token = Cookies.get("User_Token");
        const res = await axios.put(`${API}/admin/update`, formData, { 
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }, 
            withCredentials: true 
        });
        
        setAdminData(res.data.admin); 
        setIsEditOpen(false);
        setCustomAlert({ show: true, type: 'success', title: 'PROTOCOL UPDATED', message: 'Admin credentials synchronized successfully.' });
    } catch (error) {
        setCustomAlert({ show: true, type: 'error', title: 'UPDATE FAILED', message: error.response?.data?.message || 'Could not update admin profile.' });
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-mono animate-pulse">ACCESSING SECURE ARCHIVES...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-600 selection:text-white overflow-x-hidden pt-24 pb-20 relative">
      <style>{profileStyles}</style>

      {/* Background Elements */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none z-0" />
      
      {/* --- CUSTOM ALERT POPUP --- */}
      <AnimatePresence>{customAlert.show && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"><motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className={`relative w-full max-w-md p-8 rounded-2xl border-2 text-center ${customAlert.type === 'success' ? 'bg-zinc-900 border-green-500' : 'bg-zinc-950 border-red-600'}`}><div className="mb-4 flex justify-center">{customAlert.type === 'success' ? <CheckCircle size={64} className="text-green-500"/> : <AlertCircle size={64} className="text-red-600"/>}</div><h2 className={`text-2xl font-black uppercase italic mb-2 ${customAlert.type === 'success' ? 'text-green-500' : 'text-red-600'}`}>{customAlert.title}</h2><p className="text-zinc-400 font-mono text-sm mb-6">{customAlert.message}</p><button onClick={closeAlert} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase tracking-widest text-xs">DISMISS</button></motion.div></motion.div>}</AnimatePresence>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Restricted Area</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Admin <span className="text-zinc-600">Profile</span></h1>
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-12 border-t-4 border-t-red-600">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                
                {/* --- PROFILE IMAGE SECTION --- */}
                <div className="relative group">
                    <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-br from-red-600 to-black">
                        <img 
                            src={adminData?.profileImage || "https://via.placeholder.com/200"} 
                            alt="Admin" 
                            className="w-full h-full rounded-full object-cover border-4 border-black"
                        />
                        {/* Online Status Indicator (Isadmin) */}
                        <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-black ${adminData?.Isadmin ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} title={adminData?.Isadmin ? "System Online" : "Offline"}></div>
                    </div>
                    <div className="mt-4 text-center">
                         <span className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-700 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                            <Activity size={12} className={adminData?.Isadmin ? "text-green-500" : "text-zinc-600"} />
                            {adminData?.Isadmin ? "SYSTEM ACTIVE" : "OFFLINE"}
                         </span>
                    </div>
                </div>

                {/* --- DETAILS SECTION --- */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                        <h2 className="text-3xl font-bold text-white uppercase tracking-wide">{adminData?.adminname}</h2>
                        
                        {/* Main Account Badge */}
                        <div className={`mt-2 md:mt-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 ${adminData?.mainAccount ? 'status-badge-main' : 'status-badge-sub'}`}>
                            {adminData?.mainAccount ? <Crown size={14} /> : <ShieldCheck size={14} />}
                            {adminData?.mainAccount ? "ROOT ADMIN (MAIN)" : "SUB-ADMIN"}
                        </div>
                    </div>
                    
                    <p className="text-sm text-zinc-500 font-mono mb-8 flex items-center justify-center md:justify-start gap-2">
                        <Mail size={14} /> {adminData?.email}
                    </p>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
                        {/* Removed Clearance Level Card as requested */}
                        <div className="p-4 bg-black/40 rounded-xl border border-zinc-800 flex items-center gap-4">
                             <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Activity size={20}/></div>
                             <div>
                                 <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Account Status</p>
                                 <p className="text-sm font-bold text-white">OPERATIONAL</p>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsEditOpen(true)} 
                        className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
                    >
                        <Edit size={16} /> Modify Credentials
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal w-full max-w-lg rounded-3xl p-8 relative overflow-hidden"
            >
              <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
              
              <h2 className="text-2xl font-black italic text-white mb-6 flex items-center gap-2">
                <Edit size={24} className="text-red-500"/> UPDATE <span className="text-zinc-500">ADMIN</span>
              </h2>

              <form onSubmit={saveProfile} className="space-y-5">
                {/* Image Upload */}
                <div className="space-y-4">
                  <div className="relative text-center">
                    <label className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-2 block text-left">Profile Image</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700">
                            <img src={editData.profileImage || "https://via.placeholder.com/150"} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 relative group">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
                            <div className="flex items-center justify-center border border-dashed border-zinc-700 bg-black/50 rounded-lg px-4 py-3 text-zinc-400 text-sm group-hover:border-red-500 group-hover:text-red-400 transition-colors">
                                <Upload size={16} className="mr-2"/> {selectedFile ? selectedFile.name : "Click to upload new asset"}
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-1 block">Admin Name</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3">
                        <User size={16} className="text-zinc-500 mr-3"/>
                        <input type="text" name="adminname" value={editData.adminname} onChange={handleEditChange} className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-1 block">Email</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3">
                        <Mail size={16} className="text-zinc-500 mr-3"/>
                        <input type="email" name="email" value={editData.email} onChange={handleEditChange} className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-zinc-800 pt-5 mt-2">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><KeyRound size={16} className="text-red-500"/> SECURITY CREDENTIALS</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-1 block">Old Password</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3 focus-within:border-red-500 transition-colors">
                        <Lock size={16} className="text-zinc-500 mr-3"/>
                        <input type="password" name="oldPassword" value={editData.oldPassword} onChange={handleEditChange} placeholder="Enter current password" className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-1 block">New Password</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3 focus-within:border-red-500 transition-colors">
                        <ShieldCheck size={16} className="text-zinc-500 mr-3"/>
                        <input type="password" name="newPassword" value={editData.newPassword} onChange={handleEditChange} placeholder="Enter new password" className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Added Forgot Password Link for Admin */}
                  <div className="text-right mt-2">
                     <Link to="/admin/forgot-password" className="text-xs text-red-500 hover:text-white transition-colors font-mono underline decoration-zinc-800 hover:decoration-white">
                       Forgot Password?
                     </Link>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all">CANCEL</button>
                  <button type="submit" className="flex-1 py-3 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">UPDATE RECORD</button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LuxuryAdminProfile;