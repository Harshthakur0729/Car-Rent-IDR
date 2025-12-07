import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Edit, Camera, ShieldCheck, X, KeyRound, Upload, CheckCircle, AlertCircle, Crown, Activity, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; // Toast for better notifications

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
  
  .delete-input:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
  }
`;

const LuxuryAdminProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  // Modals State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Delete Logic State
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [editData, setEditData] = useState({
    adminname: '',
    email: '',
    profileImage: '',
    oldPassword: '',
    newPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const API = import.meta.env.VITE_BACKEND_URL;

  // --- FETCH ADMIN DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
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
        // navigate('/login'); // Optional: redirect if fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, API]);

  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setEditData({ ...editData, profileImage: URL.createObjectURL(file) });
    }
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    try {
      await axios.get(`${API}/admin/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminToken");
      navigate('/login');
    }
  };

  // --- DELETE ACCOUNT HANDLER (Matches your Controller) ---
  const handleDeleteAccount = async () => {
    // 1. Frontend Check
    if (deleteInput !== "delete") {
      return toast.error("Please type 'delete' exactly to confirm.");
    }

    setIsDeleting(true);
    const toastId = toast.loading("Deleting account...");

    try {
      // 2. API Call - sending comment: "delete" in body
      // NOTE: axios.delete me body bhejne ke liye 'data' key use hoti hai
      const res = await axios.delete(`${API}/admin/delete-admin`, {
        withCredentials: true,
        data: { comment: deleteInput } // Controller expects req.body.comment
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Account Deleted Successfully", { id: toastId });

        // 3. Cleanup & Redirect
        localStorage.removeItem("adminToken")
        setIsDeleteOpen(false);
        navigate('/login');
      }

    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Delete failed", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const saveToast = toast.loading("Updating profile...");

    const formData = new FormData();
    formData.append("adminname", editData.adminname);
    formData.append("email", editData.email);

    if (selectedFile) formData.append("profileImage", selectedFile);

    if (editData.newPassword) {
      formData.append("oldPassword", editData.oldPassword);
      formData.append("newPassword", editData.newPassword);
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(`${API}/admin/update`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      setAdminData(res.data.admin);
      setIsEditOpen(false);
      toast.success("Profile Updated Successfully", { id: saveToast });
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed", { id: saveToast });
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-mono animate-pulse">ACCESSING SECURE ARCHIVES...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-600 selection:text-white overflow-x-hidden pt-20 pb-20 px-4 md:px-8 relative">
      <style>{profileStyles}</style>
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      {/* Background Elements */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Restricted Area</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Admin <span className="text-zinc-600">Profile</span></h1>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-12 border-t-4 border-t-red-600">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">

            {/* --- PROFILE IMAGE SECTION --- */}
            <div className="relative group flex-shrink-0">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-red-600 to-black">
                <img
                  src={adminData?.profileImage || "https://via.placeholder.com/200"}
                  alt="Admin"
                  className="w-full h-full rounded-full object-cover border-4 border-black"
                />
                <div className={`absolute bottom-2 right-2 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-black ${adminData?.Isadmin ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} title={adminData?.Isadmin ? "System Online" : "Offline"}></div>
              </div>
              <div className="mt-4 text-center">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 text-[9px] md:text-[10px] font-bold tracking-widest uppercase ${adminData?.Isadmin ? 'bg-green-900/20 text-green-400' : 'bg-zinc-900 text-zinc-600'}`}>
                  <Activity size={12} className={adminData?.Isadmin ? "text-green-500" : "text-zinc-600"} />
                  {adminData?.Isadmin ? "SYSTEM ONLINE" : "OFFLINE"}
                </span>
              </div>
            </div>

            {/* --- DETAILS SECTION --- */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wide break-all">{adminData?.adminname}</h2>

                {/* Main Account Badge */}
                <div className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 ${adminData?.mainAccount ? 'status-badge-main' : 'status-badge-sub'}`}>
                  {adminData?.mainAccount ? <Crown size={14} /> : <ShieldCheck size={14} />}
                  {adminData?.mainAccount ? "ROOT ADMIN (MAIN)" : "SUB-ADMIN"}
                </div>
              </div>

              <p className="text-xs md:text-sm text-zinc-500 font-mono mb-8 flex items-center justify-center md:justify-start gap-2 break-all">
                <Mail size={14} className="flex-shrink-0" /> {adminData?.email}
              </p>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="p-4 bg-black/40 rounded-xl border border-zinc-800 flex items-center gap-4 justify-center md:justify-start">
                  <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Activity size={20} /></div>
                  <div className="text-left">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Account Status</p>
                    <p className="text-sm font-bold text-white">OPERATIONAL</p>
                  </div>
                </div>
              </div>

              {/* Buttons Container */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Modify Credentials
                </button>

                {/* --- DELETE BUTTON (ONLY FOR SUB-ADMINS) --- */}
                {/* Logic: Agar mainAccount FALSE hai, tabhi delete button dikhega */}
                {adminData?.mainAccount === false && (
                  <button
                    onClick={() => {
                      setDeleteInput("");
                      setIsDeleteOpen(true);
                    }}
                    className="flex-1 px-6 py-3 bg-transparent hover:bg-red-950 text-red-500 hover:text-red-400 text-xs font-bold tracking-[0.2em] uppercase rounded-lg transition-all border border-red-900/50 hover:border-red-600 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Account
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg transition-all border border-zinc-700 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isDeleteOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-red-950/80 backdrop-blur-lg p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border-2 border-red-600 w-full max-w-md rounded-3xl p-8 relative shadow-[0_0_50px_rgba(220,38,38,0.3)]"
            >
              <button onClick={() => setIsDeleteOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>

              <div className="text-center mb-6">
                <AlertTriangle size={64} className="text-red-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                  DANGER <span className="text-red-600">ZONE</span>
                </h2>
                <p className="text-zinc-400 text-sm mt-2">
                  To verify, type <span className="text-red-500 font-bold">delete</span> below.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="delete"
                  className="delete-input w-full bg-zinc-900 border border-zinc-800 text-white text-center py-3 rounded-lg font-mono text-lg placeholder-zinc-700"
                />

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "delete" || isDeleting}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${deleteInput === "delete"
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] cursor-pointer"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                >
                  {isDeleting ? "DELETING..." : "CONFIRM DELETION"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- EDIT PROFILE MODAL --- */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal w-full max-w-lg rounded-3xl p-6 md:p-8 relative overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>

              <h2 className="text-xl md:text-2xl font-black italic text-white mb-6 flex items-center gap-2">
                <Edit size={24} className="text-red-500" /> UPDATE <span className="text-zinc-500">ADMIN</span>
              </h2>

              <form onSubmit={saveProfile} className="space-y-5">
                {/* Image Upload */}
                <div className="space-y-4">
                  <div className="relative text-center">
                    <label className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-2 block text-left">Profile Image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700 flex-shrink-0">
                        <img src={editData.profileImage || "https://via.placeholder.com/150"} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 relative group w-full">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="flex items-center justify-center border border-dashed border-zinc-700 bg-black/50 rounded-lg px-4 py-3 text-zinc-400 text-sm group-hover:border-red-500 group-hover:text-red-400 transition-colors">
                          <Upload size={16} className="mr-2" /> {selectedFile ? selectedFile.name : "Click to upload new asset"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-1 block">Admin Name</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3">
                        <User size={16} className="text-zinc-500 mr-3" />
                        <input type="text" name="adminname" value={editData.adminname} onChange={handleEditChange} className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-1 block">Email</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3">
                        <Mail size={16} className="text-zinc-500 mr-3" />
                        <input type="email" name="email" value={editData.email} onChange={handleEditChange} className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-zinc-800 pt-5 mt-2">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><KeyRound size={16} className="text-red-500" /> SECURITY CREDENTIALS</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-1 block">Old Password</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3 focus-within:border-red-500 transition-colors">
                        <Lock size={16} className="text-zinc-500 mr-3" />
                        <input type="password" name="oldPassword" value={editData.oldPassword} onChange={handleEditChange} placeholder="Enter current password" className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-1 block">New Password</label>
                      <div className="flex items-center border border-zinc-800 bg-black/50 rounded-lg px-4 py-3 focus-within:border-red-500 transition-colors">
                        <ShieldCheck size={16} className="text-zinc-500 mr-3" />
                        <input type="password" name="newPassword" value={editData.newPassword} onChange={handleEditChange} placeholder="Enter new password" className="bg-transparent w-full text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/admin/forgot-password")}
                      className="
    text-[10px] 
    block
    font-mono 
    text-red-500 
    hover:text-red-300 
    tracking-widest 
    uppercase 
    mb-1  
    cursor-pointer           
    transition-all duration-200 
  "
                    >
                      Forgot Password
                    </button>


                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all">CANCEL</button>
                  <button type="submit" className="cursor-pointer flex-1 py-3 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">UPDATE RECORD</button>
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