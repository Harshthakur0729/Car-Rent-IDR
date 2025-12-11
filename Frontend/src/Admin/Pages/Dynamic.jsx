import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2, Edit, Upload, Save, Plus, X, Video, Image as ImageIcon,
  FileText, Phone, AlertCircle, CheckCircle, RefreshCw, Briefcase, User, Mail, Globe, Copyright
} from 'lucide-react';
import { ToastContainer, toast } from "react-toastify";
// ERROR FIX: CSS imports might fail in this environment. Uncomment in local.
// import "react-toastify/dist/ReactToastify.css";

// --- CUSTOM CSS ---
const managerStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 20, 20, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.2);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
  }

  .glass-card {
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  .glass-card:hover {
    border-color: rgba(6, 182, 212, 0.5);
    background: rgba(10, 20, 25, 0.6);
    transform: translateY(-2px);
  }

  .input-field {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    transition: all 0.3s ease;
  }
  .input-field:focus {
    border-color: #06b6d4;
    outline: none;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
  }

  .file-upload-box {
    border: 2px dashed rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.4);
    transition: all 0.3s;
    cursor: pointer;
  }
  .file-upload-box:hover {
    border-color: #06b6d4;
    background: rgba(6, 182, 212, 0.05);
  }
  
  /* Custom Button Gradients */
  .btn-primary {
    background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
    color: black;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
  }
`;

const DynamicContentForm = () => {
  const API = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    aboutSummary: "",
    name: "",
    profession: "",
    helpContactName: "",
    helpContactDescription: "",
    helpContactNumber: [""],
    helpContactEmail: "",
    helpContactInstaId: [""],
    header_footerName: "",
    footerDescription: "",
    footerCopyRight: "",
  });

  const [files, setFiles] = useState({
    aboutImg1: null,
    aboutImg2: null,
    aboutProfileImg: null,
    helpImg: null,
    header_footerlogo: null,
    // footerImg removed
  });

  const [dynamicData, setDynamicData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isLocked = dynamicData.length > 0 && !editId;

  // --- Fetch Data ---
  const getAllDynamic = async () => {
    try {
      const res = await axios.get(`${API}/dynamic/get/dynamic/data`, { withCredentials: true });
      setDynamicData(res.data.data || []);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setDynamicData([]);
      } else {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    getAllDynamic();
  }, []);

  const handleLockCheck = (e) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      toast.error("Creation Locked. Edit existing data below.", { icon: '🔒' });
    }
  };

  // --- Handle Input Changes ---
  const handleChange = (e, index = null, arrayName = null) => {
    const { name, value } = e.target;
    if (arrayName) {
      const newArray = [...formData[arrayName]];
      newArray[index] = value;
      setFormData({ ...formData, [arrayName]: newArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- Handle File Changes ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [e.target.name]: file });
      toast.success(`Selected: ${file.name}`, { autoClose: 2000 });
    }
  };

  // --- Add/Remove Array Fields ---
  const addField = (arrayName) => {
    setFormData({ ...formData, [arrayName]: [...formData[arrayName], ""] });
  };

  const removeField = (index, arrayName) => {
    const newArray = [...formData[arrayName]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [arrayName]: newArray });
  };

  // --- Reset Form ---
  const resetForm = () => {
    setFormData({
      aboutSummary: "",
      name: "",
      profession: "",
      helpContactName: "",
      helpContactDescription: "",
      helpContactNumber: [""],
      helpContactEmail: "",
      helpContactInstaId: [""],
      header_footerName: "",
      footerDescription: "",
      footerCopyRight: "",
    });
    setFiles({
      aboutImg1: null,
      aboutImg2: null,
      aboutProfileImg: null,
      helpImg: null,
      header_footerlogo: null,
      // footerImg removed
    });
    setEditId(null);
    setUploadProgress(0);
    document.querySelectorAll('input[type="file"]').forEach(input => input.value = "");
  };

  // --- Populate Form for Editing ---
  const handleEdit = (item) => {
    setEditId(item._id);
    const profile = item.aboutProfile?.[0] || {};

    setFormData({
      aboutSummary: item.aboutSummary || "",
      name: profile.name || "",
      profession: profile.profession || "",
      helpContactName: item.helpContactName || "",
      helpContactDescription: item.helpContactDescription || "",
      helpContactNumber: item.helpContactNumber?.length ? item.helpContactNumber : [""],
      helpContactEmail: item.helpContactEmail || "",
      helpContactInstaId: item.helpContactInstaId?.length ? item.helpContactInstaId : [""],
      header_footerName: item.header_footerName || "",
      footerDescription: item.footerDescription || "",
      footerCopyRight: item.footerCopyRight || "",
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Editing Mode Enabled");
  };

  // --- Delete Data ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;

    // TOKEN FROM LOCAL STORAGE
    const token = localStorage.getItem("adminToken");

    try {
      await axios.delete(`${API}/dynamic/delete/dynamic/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success("Deleted successfully");
      getAllDynamic();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  // --- Submit (Create or Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      handleLockCheck(e);
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    // TOKEN FROM LOCAL STORAGE
    const token = localStorage.getItem("adminToken");

    try {
      const data = new FormData();

      // Append simple fields and arrays
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach((item) => {
            data.append(key, item);
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append files
      Object.keys(files).forEach((key) => {
        if (files[key]) data.append(key, files[key]);
      });

      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      let res;
      if (editId) {
        res = await axios.put(`${API}/dynamic/update/dynamic/${editId}`, data, config);
      } else {
        res = await axios.post(`${API}/dynamic/create/dynamic`, data, config);
      }

      toast.success(res.data.message);
      resetForm();
      getAllDynamic();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // --- UI Helpers ---
  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 border-b border-zinc-700 pb-2 mb-4 mt-2">
      <Icon size={18} className="text-cyan-500" />
      <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">{title}</h3>
    </div>
  );

  const FileInputGroup = ({ label, name }) => (
    <div className="mb-4">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">{label}</label>
      <label className="file-upload-box h-20 rounded-lg flex flex-col items-center justify-center group">
        <Upload size={16} className="text-zinc-500 group-hover:text-cyan-500 mb-1" />
        <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 truncate max-w-[120px]">
          {files[name] ? files[name].name : "Choose File"}
        </span>
        <input type="file" name={name} onChange={handleFileChange} className="hidden" disabled={isLocked} />
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans p-4 md:p-8 selection:bg-cyan-500 selection:text-black">
      <style>{managerStyles}</style>
      <ToastContainer theme="dark" position="top-right" />

      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">CMS <span className="text-cyan-600">Manager</span></h1>
            <p className="text-xs text-zinc-500 mt-1">{editId ? "Editing Mode Active" : "Create New Content"}</p>
          </div>
          {editId && (
            <button onClick={resetForm} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-white transition-colors border border-red-900/50 bg-red-900/10 px-4 py-2 rounded-lg">
              <X size={14} /> CANCEL EDIT
            </button>
          )}
        </div>

        {/* --- FORM --- */}
        <div className={`glass-panel p-8 rounded-2xl relative ${isLocked ? 'opacity-90' : 'opacity-100'}`} onClickCapture={isLocked ? handleLockCheck : undefined}>

          {isLocked && (
            <div className="absolute top-4 right-4 z-20 bg-red-900/30 border border-red-500/50 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> LOCKED
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* ABOUT SECTION */}
                <div>
                  <SectionTitle icon={FileText} title="About Section" />
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Summary</label>
                    <textarea name="aboutSummary" value={formData.aboutSummary} onChange={handleChange} rows="3" className="w-full p-3 rounded-lg input-field text-sm" disabled={isLocked} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FileInputGroup label="About Image 1" name="aboutImg1" />
                    <FileInputGroup label="About Image 2" name="aboutImg2" />
                  </div>

                  {/* Profile Sub-section */}
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <label className="text-xs font-bold text-cyan-500 uppercase mb-3 block">Profile Details</label>
                    <div className="flex gap-4 mb-3">
                      <div className="w-20">
                        <FileInputGroup label="Photo" name="aboutProfileImg" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center bg-black/40 rounded-lg border border-zinc-700 px-3 py-2">
                          <User size={14} className="text-zinc-500 mr-2" />
                          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="bg-transparent w-full text-sm text-white outline-none" disabled={isLocked} />
                        </div>
                        <div className="flex items-center bg-black/40 rounded-lg border border-zinc-700 px-3 py-2">
                          <Briefcase size={14} className="text-zinc-500 mr-2" />
                          <input type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="Profession" className="bg-transparent w-full text-sm text-white outline-none" disabled={isLocked} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* HELP SECTION */}
                <div>
                  <SectionTitle icon={Phone} title="Help & Contact" />
                  <div className="flex gap-4 mb-4">
                    <div className="w-1/3">
                      <FileInputGroup label="Help Image" name="helpImg" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <input type="text" name="helpContactName" value={formData.helpContactName} onChange={handleChange} placeholder="Contact Person" className="w-full p-2 rounded-lg input-field text-sm" disabled={isLocked} />
                      <input type="email" name="helpContactEmail" value={formData.helpContactEmail} onChange={handleChange} placeholder="Email Address" className="w-full p-2 rounded-lg input-field text-sm" disabled={isLocked} />
                    </div>
                  </div>
                  <textarea name="helpContactDescription" value={formData.helpContactDescription} onChange={handleChange} rows="2" placeholder="Description..." className="w-full p-3 rounded-lg input-field text-sm mb-4" disabled={isLocked} />

                  {/* Dynamic Arrays */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Phone Numbers</label>
                      {formData.helpContactNumber.map((num, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input value={num} onChange={(e) => handleChange(e, i, "helpContactNumber")} className="w-full bg-black/50 border border-zinc-700 rounded px-2 py-1 text-xs text-white" disabled={isLocked} />
                          {!isLocked && <button type="button" onClick={() => removeField(i, "helpContactNumber")} className="text-red-500 hover:text-red-400"><X size={14} /></button>}
                        </div>
                      ))}
                      {!isLocked && <button type="button" onClick={() => addField("helpContactNumber")} className="text-[10px] text-cyan-500 font-bold flex items-center gap-1"><Plus size={10} /> Add</button>}
                    </div>

                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Instagram IDs</label>
                      {formData.helpContactInstaId.map((id, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input value={id} onChange={(e) => handleChange(e, i, "helpContactInstaId")} className="w-full bg-black/50 border border-zinc-700 rounded px-2 py-1 text-xs text-white" disabled={isLocked} />
                          {!isLocked && <button type="button" onClick={() => removeField(i, "helpContactInstaId")} className="text-red-500 hover:text-red-400"><X size={14} /></button>}
                        </div>
                      ))}
                      {!isLocked && <button type="button" onClick={() => addField("helpContactInstaId")} className="text-[10px] text-cyan-500 font-bold flex items-center gap-1"><Plus size={10} /> Add</button>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER SECTION (Full Width) */}
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <SectionTitle icon={Globe} title="Header & Footer Config" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="space-y-4">
                  <FileInputGroup label="Header Logo" name="header_footerlogo" />
                  {/* Footer BG Image Removed */}
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Brand Name</label>
                      <input type="text" name="header_footerName" value={formData.header_footerName} onChange={handleChange} className="w-full p-2 rounded-lg input-field text-sm" disabled={isLocked} />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Copyright Text</label>
                      <input type="text" name="footerCopyRight" value={formData.footerCopyRight} onChange={handleChange} className="w-full p-2 rounded-lg input-field text-sm" disabled={isLocked} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Footer Description</label>
                    <textarea name="footerDescription" value={formData.footerDescription} onChange={handleChange} rows="2" className="w-full p-2 rounded-lg input-field text-sm" disabled={isLocked} />
                  </div>
                </div>
              </div>
            </div>

            {/* PROGRESS & SUBMIT */}
            {loading && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-6 overflow-hidden">
                <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading || isLocked}
                className={`px-8 py-3 rounded-xl font-black text-sm tracking-widest uppercase flex items-center gap-2 transition-all shadow-lg ${loading || isLocked
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-black btn-primary'
                  }`}
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {editId ? "UPDATE SYSTEM DATA" : "INITIALIZE SYSTEM"}
              </button>
            </div>

          </form>
        </div>

        {/* EXISTING DATA LIST  */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-cyan-600 pl-4">Current Configuration</h2>
          {dynamicData.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-600">
              <p>No configuration found. Please initialize above.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {dynamicData.map((item) => (
                <div key={item._id} className="glass-card p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 border border-zinc-800">
                  <div className="flex items-center gap-4">
                    {item.header_footerlogo && <img src={item.header_footerlogo} alt="Logo" className="w-12 h-12 object-contain bg-zinc-900 rounded p-1" />}
                    <div>
                      <h4 className="font-bold text-lg text-white">{item.header_footerName || "Site Config"}</h4>
                      <p className="text-xs text-zinc-500 font-mono">ID: {item._id}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(item)} className="p-2.5 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600 hover:text-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold">
                      <Edit size={16} /> EDIT
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2.5 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold">
                      <Trash2 size={16} /> DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DynamicContentForm;