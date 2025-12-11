import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Shield, UserPlus, Users, Activity,
  XCircle, Mail, Lock, User, Trash2, X, Edit, Save
} from "lucide-react";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editAdminId, setEditAdminId] = useState(null);

  const [currentAdmin, setCurrentAdmin] = useState(null);

  const [formData, setFormData] = useState({
    adminname: "",
    email: "",
    password: "",
  });

  const API = import.meta.env.VITE_BACKEND_URL;

  // --- FETCH CURRENT PROFILE ---
  const fetchCurrentProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/profile`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        setCurrentAdmin(res.data.admin);
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    }
  };

  // --- FETCH ALL ADMINS ---
  const fetchAllAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/all-admin-data`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setAdmins(res.data.admins || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load admin list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentProfile();
    fetchAllAdmins();
  }, []);

  // --- DELETE ADMIN ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Sub-Admin? This action cannot be undone.")) {
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.delete(`${API}/admin/delete/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAllAdmins();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  const handleEditClick = (admin) => {
    setEditAdminId(admin._id);
    setFormData({
      adminname: admin.adminname,
      email: admin.email,
      password: "",
    });
    setShowUpdateModal(true);
  };

  // --- UPDATE ADMIN ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(`${API}/admin/update/${editAdminId}`, formData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(res.data.message || "Updated Successfully");
        setShowUpdateModal(false);
        setFormData({ adminname: "", email: "", password: "" });
        setEditAdminId(null);
        fetchAllAdmins();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Update Failed");
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    if (admin.mainAccount === true) return false;
    if (filter === "online") return admin.Isadmin === true;
    if (filter === "offline") return admin.Isadmin === false;
    return true;
  });

  // --- CREATE ADMIN ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.adminname || !formData.email || !formData.password) {
      return toast.error("Please fill all required fields");
    }
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${API}/admin/register`, formData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowCreateModal(false);
        setFormData({ adminname: "", email: "", password: "" });
        fetchAllAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans overflow-x-hidden">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 uppercase tracking-tighter flex items-center gap-3">
              <Shield className="text-red-600 w-8 h-8 md:w-10 md:h-10" /> Admin Management
            </h1>
            <p className="text-neutral-500 mt-2 text-sm md:text-base">Manage Sub-Admins and View Status</p>
          </div>

          {currentAdmin?.mainAccount === true && (
            <button
              onClick={() => {
                setFormData({ adminname: "", email: "", password: "" });
                setShowCreateModal(true);
              }}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              <UserPlus size={20} /> Create Sub-Admin
            </button>
          )}
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 md:gap-4 mb-8 border-b border-neutral-800 pb-4 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex-shrink-0 flex items-center gap-2 ${filter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}>
            <Users size={14} /> All ({admins.filter(a => !a.mainAccount).length})
          </button>
          <button onClick={() => setFilter("online")} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex-shrink-0 flex items-center gap-2 ${filter === 'online' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-neutral-500 hover:text-green-400'}`}>
            <Activity size={14} /> Online
          </button>
          <button onClick={() => setFilter("offline")} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex-shrink-0 flex items-center gap-2 ${filter === 'offline' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'text-neutral-500 hover:text-red-400'}`}>
            <XCircle size={14} /> Offline
          </button>
        </div>

        {/* ADMIN GRID  */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 animate-pulse">Loading Admins...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredAdmins.length === 0 && (
              <div className="col-span-full text-center py-20 bg-neutral-950 border border-dashed border-neutral-800 rounded-2xl text-neutral-500 text-sm">
                No Sub-Admins found.
              </div>
            )}

            {filteredAdmins.map((admin) => (
              <div key={admin._id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 hover:border-red-600/40 transition-all group relative overflow-hidden shadow-lg hover:shadow-red-900/10">

                {/* ACTIONS (Only for Main Admin) */}
                {currentAdmin?.mainAccount === true && (
                  <div className="absolute top-4 left-4 flex gap-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0">
                    <button
                      onClick={() => handleEditClick(admin)}
                      className="p-2 bg-neutral-900/90 text-blue-500 hover:text-white hover:bg-blue-600 rounded-full transition-colors border border-neutral-800"
                      title="Edit Details"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="p-2 bg-neutral-900/90 text-red-500 hover:text-white hover:bg-red-600 rounded-full transition-colors border border-neutral-800"
                      title="Delete Sub-Admin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* Status Indicator */}
                <div className={`absolute top-4 right-4 px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border flex items-center gap-1
                  ${admin.Isadmin ? 'bg-green-900/20 text-green-500 border-green-800' : 'bg-red-900/20 text-red-500 border-red-800'}
                `}>
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${admin.Isadmin ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {admin.Isadmin ? "Online" : "Offline"}
                </div>

                {/* Profile Info */}
                <div className="flex items-center gap-4 mb-6 mt-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                    {admin.profileImage ? (
                      <img src={admin.profileImage} alt="admin" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-neutral-600" size={28} />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-base md:text-lg font-bold text-white group-hover:text-red-500 transition-colors truncate">{admin.adminname}</h3>
                    <p className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-wider font-semibold">Sub-Admin</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-400 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/50">
                    <Mail size={16} className="text-red-500 flex-shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 text-[10px] text-neutral-600 flex justify-between uppercase tracking-widest font-medium">
                  <span className="truncate max-w-[80px]">ID: {admin._id.slice(-6)}</span>
                  <span>{new Date(admin.createdAt).toLocaleDateString()}</span>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* 1. CREATE MODAL  */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>

            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl shadow-red-900/20 relative z-10 overflow-hidden animate-scale-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -z-0"></div>

              <div className="p-6 border-b border-neutral-800 flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserPlus className="text-red-500" size={24} /> New Sub-Admin
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">Create a new access account</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 bg-neutral-900 rounded-full text-neutral-500 hover:text-white hover:bg-red-600 transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegister} className="p-6 space-y-5 relative z-10">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase ml-1">Username</label>
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-red-600 transition-all">
                    <User size={18} className="text-neutral-500 mr-3" />
                    <input type="text" name="adminname" required value={formData.adminname} onChange={handleInputChange} placeholder="e.g. John Doe" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-neutral-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase ml-1">Email Address</label>
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-red-600 transition-all">
                    <Mail size={18} className="text-neutral-500 mr-3" />
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="admin@company.com" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-neutral-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase ml-1">Secure Password</label>
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-red-600 transition-all">
                    <Lock size={18} className="text-neutral-500 mr-3" />
                    <input type="password" name="password" required value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-neutral-600" />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                    <UserPlus size={18} /> Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. UPDATE MODAL  */}
        {showUpdateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowUpdateModal(false)}></div>

            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl shadow-blue-900/20 relative z-10 overflow-hidden animate-scale-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -z-0"></div>

              <div className="p-6 border-b border-neutral-800 flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit className="text-blue-500" size={24} /> Update Sub-Admin
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">Modify account details</p>
                </div>
                <button onClick={() => setShowUpdateModal(false)} className="p-2 bg-neutral-900 rounded-full text-neutral-500 hover:text-white hover:bg-blue-600 transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-5 relative z-10">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase ml-1">Username</label>
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-blue-600 transition-all">
                    <User size={18} className="text-neutral-500 mr-3" />
                    <input type="text" name="adminname" value={formData.adminname} onChange={handleInputChange} className="bg-transparent border-none outline-none text-white w-full text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase ml-1">Email Address</label>
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-blue-600 transition-all">
                    <Mail size={18} className="text-neutral-500 mr-3" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-transparent border-none outline-none text-white w-full text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase ml-1">New Password (Optional)</label>
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-blue-600 transition-all">
                    <Lock size={18} className="text-neutral-500 mr-3" />
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Leave empty to keep same" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-neutral-600" />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                    <Save size={18} /> Update Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminManagement;