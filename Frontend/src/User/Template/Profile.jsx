import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Edit, Camera, LogOut, X, Check, Calendar, CreditCard, ShieldCheck, KeyRound, Upload, Trash2, AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const profileStyles = `
  /* --- HIDE HEADER & FOOTER ON THIS PAGE --- */
  header, footer {
    display: none !important;
  }

  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .glass-modal {
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.3);
  }

  /* Danger Modal Specific */
  .glass-modal-danger {
    background: rgba(15, 5, 5, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.4);
    box-shadow: 0 0 50px rgba(220, 38, 38, 0.2);
  }

  .status-badge-completed { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
  .status-badge-booked { background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); }
  .status-badge-cancelled { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
`;

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [customAlert, setCustomAlert] = useState({ show: false, type: 'success', title: '', message: '' });

  const [editData, setEditData] = useState({ username: '', email: '', profileImage: '', oldPassword: '', newPassword: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  // --- PROCESSING STATES ---
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("userToken");
        console.log(token);

        const res = await axios.get(`${API}/user/profile`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(res.data.user);
        setEditData({
          username: res.data.user.username,
          email: res.data.user.email,
          profileImage: res.data.user.profileImage,
          oldPassword: '',
          newPassword: ''
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('userToken');
          navigate('/login');
          return;
        }
        setCustomAlert({ show: true, type: 'error', title: 'CONNECTION ERROR', message: error.response?.data?.message || 'Could not retrieve pilot data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, API]);

  const handleLogout = async () => {
    try { await axios.get(`${API}/user/logout`, { withCredentials: true }); } catch (error) { console.error(error); }
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      setIsDeleteOpen(false);
      setCustomAlert({ show: true, type: 'error', title: 'INVALID COMMAND', message: 'Incorrect confirmation code.' });
      setDeleteConfirmation(""); return;
    }
    try {
      const token = localStorage.getItem("userToken");
      await axios.delete(`${API}/user/delete-account`, {
        data: { comment: "delete" },
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteOpen(false);
      setCustomAlert({ show: true, type: 'success', title: 'ACCOUNT TERMINATED', message: 'Your data has been wiped.' });
    } catch (error) {
      setCustomAlert({ show: true, type: 'error', title: 'DELETE FAILED', message: error.response?.data?.message || 'Server rejected request.' });
    }
  };

  const closeAlert = () => {
    setCustomAlert({ ...customAlert, show: false });
    if (customAlert.title === 'ACCOUNT TERMINATED') {

      localStorage.removeItem('userToken');
      navigate('/login');
    }
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
    setIsUpdating(true); // Start Loading
    setUploadProgress(0); // Reset Progress

    const formData = new FormData();
    formData.append("username", editData.username);
    formData.append("email", editData.email);

    if (selectedFile) formData.append("profileImage", selectedFile);

    if (editData.newPassword) {
      formData.append("oldPassword", editData.oldPassword);
      formData.append("newPassword", editData.newPassword);
    }

    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.put(`${API}/user/update`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        withCredentials: true,
        // TRACK UPLOAD PROGRESS
        onUploadProgress: (progressEvent) => {
             const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
             setUploadProgress(percentCompleted);
        }
      });

      setUserData(res.data.user);
      setIsEditOpen(false);
      setCustomAlert({ show: true, type: 'success', title: 'PROFILE UPDATED', message: 'User data synchronized.' });
    } catch (error) {
      setCustomAlert({ show: true, type: 'error', title: 'UPDATE FAILED', message: error.response?.data?.message || 'Could not update profile.' });
    } finally {
        setIsUpdating(false); // Stop Loading
        setUploadProgress(0);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">LOADING PILOT DATA...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden pt-24 pb-20 relative">
      <style>{profileStyles}</style>

      <AnimatePresence>{customAlert.show && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"><motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className={`relative w-full max-w-md p-8 rounded-2xl border-2 text-center ${customAlert.type === 'success' ? 'bg-zinc-900 border-green-500' : 'bg-zinc-950 border-red-600'}`}><div className="mb-4 flex justify-center">{customAlert.type === 'success' ? <CheckCircle size={64} className="text-green-500" /> : <AlertCircle size={64} className="text-red-600" />}</div><h2 className={`text-2xl font-black uppercase italic mb-2 ${customAlert.type === 'success' ? 'text-green-500' : 'text-red-600'}`}>{customAlert.title}</h2><p className="text-zinc-400 font-mono text-sm mb-6">{customAlert.message}</p><button onClick={closeAlert} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase tracking-widest text-xs">DISMISS</button></motion.div></motion.div>}</AnimatePresence>

      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home Button (Since Header is hidden) */}
        <div className="absolute top-8 left-8">
          <Link to="/" className="text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-bold tracking-widest transition-colors">
            <X size={16} /> EXIT COMMAND CENTER
          </Link>
        </div>

        <div className="mb-12 text-center"><span className="text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Command Center</span><h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Pilot <span className="text-zinc-500">Profile</span></h1></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-3xl p-8 text-center relative overflow-hidden border-t-4 border-t-cyan-500">
              <div className="relative w-32 h-32 mx-auto mb-6"><img src={userData?.profileImage || "https://via.placeholder.com/150"} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-black relative z-10" />
                {userData?.verify &&
                  <div className="absolute bottom-1 right-1 bg-green-500 text-black p-1 rounded-full border-2 border-black z-20">
                    <Check size={16} />
                  </div>}
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
                {userData?.username}
              </h2>
              <p className="text-sm text-zinc-400 font-mono mb-6">{userData?.email}</p>
              <div className="space-y-3 text-left bg-black/40 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${userData?.verify ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
                    {userData?.verify ? "VERIFIED" : "UNVERIFIED"}</span>
                </div>
                <button onClick={() => setIsDeleteOpen(true)} className="w-full py-2 bg-red-950/30 hover:bg-red-900/60 text-red-500 border border-red-900/50 text-xs font-bold uppercase rounded flex items-center justify-center gap-2 transition-all mb-2">
                  <Trash2 size={14} />
                  DELETE ACCOUNT
                </button>
                <button onClick={handleLogout} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600/30 text-xs font-bold uppercase rounded flex items-center justify-center gap-2 transition-all">
                  <LogOut size={14} /> Logout Session</button>
              </div>
              <button onClick={() => setIsEditOpen(true)} className="w-full mt-6 py-3 bg-zinc-800 hover:bg-cyan-900/30 text-white text-xs font-bold tracking-[0.2em] border border-zinc-700 hover:border-cyan-500 transition-all uppercase rounded-lg flex items-center justify-center gap-2"><Edit size={16} /> Edit Profile</button></div></div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold uppercase italic tracking-wide">Garage History</h3>
              <span className="text-xs font-mono text-zinc-500">{userData?.cars?.length || 0} RECORDS</span>
            </div>
            <div className="space-y-4">{userData?.cars?.map((car) => (<div key={car._id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-colors group">
              <div className="w-full md:w-32 h-20 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
                <img src={car.image || "https://via.placeholder.com/200"} alt="Car" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                  <h4 className="text-lg font-bold text-white italic">{car.carName}</h4>
                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest ${car.status.trim() === 'Completed' ? 'status-badge-completed' : car.status.trim() === 'booked' ? 'status-badge-booked' : 'status-badge-cancelled'}`}>{car.status}</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-zinc-400 font-mono">
                  <span>PLATE: {car.carNumber}</span>
                  <span>PRICE: ${car.price}</span>
                </div>
                <div className="mt-3 flex items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-zinc-500 bg-black/30 py-2 px-3 rounded-lg w-fit mx-auto md:mx-0">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(car.startTime).toLocaleDateString()}</span>
                  <span className="text-zinc-700">&rarr;</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(car.endTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{isDeleteOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-modal-danger w-full max-w-md rounded-3xl p-8 relative overflow-hidden text-center">
            <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border-2 border-red-600 animate-pulse"><AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black italic text-red-500 mb-2 uppercase tracking-wider">Danger Zone</h2>
            <p className="text-zinc-300 text-sm mb-6 font-mono">Are you sure you want to permanently delete your account?</p>
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-red-400 mb-2 uppercase tracking-widest">Type "delete" to confirm</label><input type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} className="w-full bg-black border border-red-800 rounded-lg py-3 px-4 text-center text-white focus:outline-none focus:border-red-500 uppercase font-mono" placeholder="DELETE" /></div><div className="flex gap-3"><button onClick={() => { setIsDeleteOpen(false); setDeleteConfirmation(""); }} className="flex-1 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold tracking-widest transition-all cursor-pointer">CANCEL</button><button onClick={handleDeleteAccount} className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)]">CONFIRM</button></div></motion.div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{isEditOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-modal w-full max-w-lg rounded-3xl p-8 relative overflow-hidden"><button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button><h2 className="text-2xl font-black italic text-white mb-6 flex items-center gap-2"><Edit size={24} className="text-cyan-500" /> UPDATE <span className="text-zinc-500">PROFILE</span></h2><form onSubmit={saveProfile} className="space-y-5"><div className="space-y-4"><div className="relative text-center"><label className="text-[10px] font-mono text-cyan-500 tracking-widest uppercase mb-2 block text-left">Profile Image</label><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700"><img src={editData.profileImage || "https://via.placeholder.com/150"} alt="Preview" className="w-full h-full object-cover" /></div><div className="flex-1 relative group"><input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" /><div className="flex items-center justify-center border border-dashed border-zinc-700 bg-black/50 rounded-lg px-4 py-3 text-zinc-400 text-sm group-hover:border-cyan-500 group-hover:text-cyan-400 transition-colors"><Upload size={16} className="mr-2" /> {selectedFile ? selectedFile.name : "Click to upload new image"}</div></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-[10px] font-mono text-cyan-500 tracking-widest uppercase mb-1 block">Username</label><div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3"><User size={16} className="text-zinc-500 mr-3" /><input type="text" name="username" value={editData.username} onChange={handleEditChange} className="bg-transparent w-full text-sm text-white focus:outline-none" /></div></div><div><label className="text-[10px] font-mono text-cyan-500 tracking-widest uppercase mb-1 block">Email</label><div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3"><Mail size={16} className="text-zinc-500 mr-3" /><input type="email" name="email" value={editData.email} onChange={handleEditChange} className="bg-transparent w-full text-sm text-white focus:outline-none" /></div></div></div></div><div className="border-t border-zinc-800 pt-5 mt-2"><h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><KeyRound size={16} className="text-cyan-500" /> SECURITY SETTINGS</h3><div className="space-y-4"><div><label className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-1 block">Old Password</label><div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3 focus-within:border-cyan-500 transition-colors"><Lock size={16} className="text-zinc-500 mr-3" /><input type="password" name="oldPassword" value={editData.oldPassword} onChange={handleEditChange} placeholder="Enter current password" className="bg-transparent w-full text-sm text-white focus:outline-none" /></div></div><div>
        <label className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-1 block">New Password</label>
        <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3 focus-within:border-cyan-500 transition-colors">
          <ShieldCheck size={16} className="text-zinc-500 mr-3" />
          <input type="password" name="newPassword" value={editData.newPassword} onChange={handleEditChange} placeholder="Enter new password" className="bg-transparent w-full text-sm text-white focus:outline-none" />
        </div>
      </div>
        <div className="text-right"><Link to="/forgot-password" className="text-xs text-cyan-500 hover:text-white transition-colors font-mono underline decoration-zinc-800 hover:decoration-white">Forgot Password?</Link></div></div></div>
        
        {/* Progress Bar for Updating */}
        {isUpdating && (
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-4 mb-2 overflow-hidden relative">
                <div 
                  className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300 progress-bar-stripes" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
            </div>
        )}

        <div className="flex gap-4 mt-6 pt-4">
            <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all">CANCEL</button>
            <button 
                type="submit" 
                disabled={isUpdating}
                className={`flex-1 py-3 rounded-lg text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer flex items-center justify-center gap-2 ${isUpdating ? 'bg-zinc-600 cursor-not-allowed text-zinc-400' : 'bg-cyan-600 hover:bg-cyan-500'}`}
            >
                {isUpdating ? <><RefreshCw className="animate-spin" size={14}/> PROCESSING {uploadProgress}%</> : "SAVE CHANGES"}
            </button>
        </div>
        </form></motion.div></motion.div>)}</AnimatePresence>
    </div>
  );
};

export default Profile;