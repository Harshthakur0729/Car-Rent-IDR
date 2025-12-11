import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, User, Mail, CheckCircle, X, AlertTriangle, Filter, Eye, CreditCard, UserCog, ExternalLink, BadgeCheck, ShieldAlert, Image as ImageIcon, Download, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const userStyles = `
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

  .glass-modal-danger {
    background: rgba(15, 5, 5, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.4);
    box-shadow: 0 0 50px rgba(220, 38, 38, 0.2);
  }
  
  .glass-modal-success {
    background: rgba(5, 20, 10, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(34, 197, 94, 0.4);
    box-shadow: 0 0 50px rgba(34, 197, 94, 0.2);
  }

  .table-row:hover {
    background: rgba(220, 38, 38, 0.05);
    border-left: 2px solid #dc2626;
  }
  
  /* Custom Scrollbar for modal content */
  .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 10px; }
`;

const User_manage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  const API = import.meta.env.VITE_BACKEND_URL;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      const res = await axios.get(`${API}/admin/getalluser`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const userData = res.data.user || [];
      setUsers(userData);
      setFilteredUsers(userData);

    } catch (error) {
      console.error("Fetch error:", error);
      showAlert('error', 'Failed to retrieve user database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      result = result.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'ALL') {
      const isVerified = filterStatus === 'VERIFIED';
      result = result.filter(user => (user.cardverify === true) === isVerified);
    }
    setFilteredUsers(result);
  }, [searchTerm, filterStatus, users]);

  //  HELPERS 
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);
  };

  //  HANDLERS 
  const handleView = (user) => {
    setUserToView(user);
    setIsViewOpen(true);
  };

  const handleRedirect = () => {
    if (userToView) {
      navigate(`/admin/user/details/${userToView._id}`);
    }
  };

  const UserDetailsRedirect = (user) => {
    navigate(`/admin/user/details/${user._id}`);
  }


  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  //  DELETE USER 
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API}/admin/user-delete/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      showAlert('success', `User ${userToDelete.username} terminated.`);

      const updatedList = users.filter(u => u._id !== userToDelete._id);
      setUsers(updatedList);
      setFilteredUsers(updatedList);

      setIsDeleteOpen(false);
      setUserToDelete(null);

    } catch (error) {
      console.error("Delete failed:", error);
      showAlert('error', 'Failed to delete user.');
    }
  };

  //  DOWNLOAD DETAILS HANDLER 
  const downloadDetails = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.get(`${API}/admin/send-excel-email`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      // Show Success Popup
      setIsDownloadOpen(true);

    } catch (error) {
      console.error("Download error:", error);
      showAlert('error', 'Failed to send export email.');
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-mono animate-pulse">ACCESSING DATABASE...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-600 selection:text-white overflow-hidden p-4 md:p-8 relative">
      <style>{userStyles}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

      {/* Alert Toast */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-20 right-4 md:right-6 z-[100] px-6 py-3 rounded-lg border flex items-center gap-3 shadow-2xl w-auto max-w-[90%] ${alert.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-200' : 'bg-red-900/90 border-red-500 text-red-200'}`}
          >
            {alert.type === 'success' ? <CheckCircle size={18} className="flex-shrink-0" /> : <AlertTriangle size={18} className="flex-shrink-0" />}
            <span className="font-bold text-xs tracking-widest">{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto pb-20">

        {/*  HEADER & ACTIONS  */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
          <div className="w-full lg:w-auto">
            <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Database Management</span>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
              Manage <span className="text-zinc-600">Users</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-4 pr-10 text-sm text-zinc-300 focus:border-red-600 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* DOWNLOAD BUTTON */}
            <button
              onClick={downloadDetails}
              className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-red-600 transition-all w-full sm:w-auto flex items-center justify-center"
              title="Export Data"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/*  USERS TABLE  */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-zinc-800">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-red-950/20 border-b border-red-900/30 text-xs font-bold text-red-400 uppercase tracking-widest">
                  <th className="p-4 md:p-6">User Identity</th>
                  <th className="p-4 md:p-6">Contact</th>
                  <th className="p-4 md:p-6">Docs Status</th>
                  <th className="p-4 md:p-6">Joined</th>
                  <th className="p-4 md:p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="table-row border-b border-zinc-800/50 transition-all duration-200 group">

                      {/* User Identity */}
                      <td className="p-4 md:p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 flex-shrink-0">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} className="text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-[150px]">{user.username}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase">ID: {user._id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 md:p-6 text-zinc-400 font-mono text-xs">
                        <div className="flex items-center gap-2 truncate max-w-[200px]">
                          <Mail size={12} className="flex-shrink-0" /> {user.email}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 md:p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${user.cardverify ? 'bg-green-900/20 text-green-400 border-green-900/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30'}`}>
                          {user.cardverify ? <BadgeCheck size={12} /> : <AlertTriangle size={12} />}
                          {user.cardverify ? 'Verified' : 'Pending'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 md:p-6 text-zinc-500 text-xs font-mono whitespace-nowrap">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 md:p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(user)}
                            className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => confirmDelete(user)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>

                          <button
                            onClick={() => UserDetailsRedirect(user)}
                            className="p-2 text-zinc-400 hover:text-green-500 hover:bg-green-900/20 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <UserCog size={18} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-zinc-500 font-mono">
                      NO USERS FOUND MATCHING CRITERIA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/*  VIEW USER DETAILS MODAL  */}
      <AnimatePresence>
        {isViewOpen && userToView && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setIsViewOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-modal w-full max-w-lg rounded-3xl p-6 md:p-8 relative overflow-hidden custom-scrollbar max-h-[85vh] overflow-y-auto"
            >
              <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors"><X size={20} /></button>

              {/* User Header */}
              <div className="text-center mb-8 mt-4">
                <div className="w-24 h-24 mx-auto rounded-full border-2 border-red-600 overflow-hidden mb-4 bg-zinc-900 flex items-center justify-center shadow-lg shadow-red-900/20">
                  {userToView.profileImage ? (
                    <img src={userToView.profileImage} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-zinc-600" />
                  )}
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wide break-words">{userToView.username}</h2>
                <p className="text-sm text-zinc-500 font-mono break-all mt-1">{userToView.email}</p>
              </div>

              <div className="space-y-6">
                {/* ID Card Section */}
                <div>
                  <label className="text-[10px] font-bold text-red-500 tracking-widest block mb-3 flex items-center gap-2">
                    <ImageIcon size={12} /> IDENTITY DOCUMENT
                  </label>
                  {userToView.card ? (
                    <div className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 h-48 md:h-64 relative group">
                      <img
                        src={userToView.card}
                        alt="User ID Card"
                        className="w-full h-full object-contain"
                      />
                      <a
                        href={userToView.card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-xs tracking-widest cursor-pointer border-2 border-red-600/50 m-2 rounded-lg"
                      >
                        <Eye size={24} className="text-red-500 mb-1" />
                        <span>CLICK TO ZOOM</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-yellow-600/50 bg-yellow-900/10 flex flex-col items-center justify-center text-yellow-500 h-48">
                      <ShieldAlert size={32} className="mb-3 opacity-80" />
                      <span className="text-xs font-bold tracking-widest">DOCUMENT MISSING</span>
                      <p className="text-[10px] mt-2 opacity-70 text-center">User has not uploaded identity proof.</p>
                    </div>
                  )}
                </div>

                {/* Status Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 gap-4">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-300">VERIFICATION STATUS</span>
                  </div>
                  <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${userToView.cardverify ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-red-900/20 text-red-400 border border-red-900/30'}`}>
                    {userToView.cardverify ? "VERIFIED" : "NOT VERIFIED"}
                  </span>
                </div>

                {/* Redirect Button */}
                <button
                  onClick={handleRedirect}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-xl shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                >
                  <ExternalLink size={16} /> VIEW FULL PROFILE
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*  DELETE CONFIRMATION MODAL  */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal-danger w-full max-w-sm rounded-3xl p-8 relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border-2 border-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-white mb-3 uppercase tracking-wide">Terminate User?</h2>
              <p className="text-zinc-400 text-xs mb-8 font-mono leading-relaxed">
                Are you sure you want to delete <span className="text-red-500 font-bold">{userToDelete?.username}</span>? This cannot be undone.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold tracking-widest transition-all cursor-pointer">CANCEL</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest transition-all shadow-lg shadow-red-900/20 cursor-pointer">CONFIRM DELETE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*  DOWNLOAD SUCCESS MODAL  */}
      <AnimatePresence>
        {isDownloadOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal-success w-full max-w-sm rounded-3xl p-8 relative overflow-hidden text-center"
            >
              <button onClick={() => setIsDownloadOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>

              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <FileSpreadsheet size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-3 uppercase tracking-wide">Export Successful</h2>
              <p className="text-zinc-300 text-xs mb-8 font-mono leading-relaxed">
                All data has been sent to your registered email ID.
              </p>

              <button
                onClick={() => setIsDownloadOpen(false)}
                className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold tracking-widest transition-all shadow-lg shadow-green-900/40"
              >
                OKAY
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default User_manage;