import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileBadge, CheckCircle, XCircle, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

const docStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 24, 27, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.2);
    box-shadow: 0 0 40px rgba(0,0,0,0.6);
  }

  .upload-zone {
    background: rgba(0, 0, 0, 0.6);
    border: 2px dashed rgba(6, 182, 212, 0.3);
    transition: all 0.3s ease;
  }
  .upload-zone:hover {
    border-color: #06b6d4;
    background: rgba(6, 182, 212, 0.05);
  }

  .glass-alert {
    background: rgba(10, 10, 10, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.3);
    box-shadow: 0 0 50px rgba(6, 182, 212, 0.2);
  }
`;

const Document = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

    const API = import.meta.env.VITE_BACKEND_URL;
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };


    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const closeAlert = () => {
        setAlert({ ...alert, show: false });
        if (alert.type === 'success') {
            navigate('/customers');
        }
    };

    const uploadDocument = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setAlert({ show: true, type: 'error', message: 'Please select a document to upload.' });
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("userToken");

        const formData = new FormData();
        formData.append("Document_File_upload", selectedFile);

        try {
            const res = await axios.post(`${API}/user/doc-upload`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            });

            setAlert({
                show: true,
                type: 'success',
                message: res.data.message || "Identity verification successful. You can now book vehicles."
            });
        } catch (error) {
            console.error("Upload Error:", error);
            const errorMsg = error.response?.data?.message || "Server error during upload.";
            setAlert({ show: true, type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden relative flex items-center justify-center p-6">
            <style>{docStyles}</style>

            {/* Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-0" />

            {/*  ALERT POPUP  */}
            <AnimatePresence>
                {alert.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="glass-alert w-full max-w-md p-8 rounded-2xl text-center border border-zinc-700"
                        >
                            <div className="mb-4 flex justify-center">
                                {alert.type === 'success'
                                    ? <CheckCircle size={64} className="text-cyan-500" />
                                    : <XCircle size={64} className="text-red-500" />
                                }
                            </div>
                            <h2 className={`text-2xl font-black uppercase italic tracking-wider mb-2 ${alert.type === 'success' ? 'text-cyan-500' : 'text-red-500'}`}>
                                {alert.type === 'success' ? 'VERIFIED' : 'ERROR'}
                            </h2>
                            <p className="text-zinc-400 text-sm mb-8 font-mono">{alert.message}</p>
                            <button
                                onClick={closeAlert}
                                className={`w-full py-3 font-bold text-xs tracking-[0.2em] uppercase rounded-lg transition-all ${alert.type === 'success' ? 'bg-cyan-600 text-black hover:bg-cyan-500' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                            >
                                {alert.type === 'success' ? 'CONTINUE TO BOOKING' : 'TRY AGAIN'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/*  MAIN CONTENT  */}
            <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-4xl glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row"
            >

                {/* Left: Information */}
                <div className="w-full md:w-2/5 bg-zinc-900/80 p-10 flex flex-col justify-between border-r border-zinc-800">
                    <div>
                        <div className="w-12 h-12 bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-900/50 mb-6">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-3xl font-black italic text-white uppercase leading-none mb-4">
                            Verify <br /><span className="text-cyan-500">Identity</span>
                        </h1>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                            To ensure proper verification and comply with our policy requirements,
                            you are required to upload either your <b className='font-extrabold'> Aadhaar Card, PAN Card, or Driving License.</b> <b className='font-extrabold'>Submitting any one of these documents is mandatory.</b> This helps us verify your identity and allows us to take appropriate action in case any issue arises, as per our policy
                        </p>
                        <ul className="space-y-3 text-xs text-zinc-500 font-mono">
                            <li className="flex items-center gap-2"><CheckCircle size={12} className="text-cyan-600" /> SECURE UPLOAD</li>
                            <li className="flex items-center gap-2"><CheckCircle size={12} className="text-cyan-600" /> INSTANT VERIFICATION</li>
                        </ul>
                    </div>
                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Protected by DriftOS Security</p>
                    </div>
                </div>

                {/* Right: Upload Form */}
                <div className="w-full md:w-3/5 p-10 flex flex-col justify-center bg-black/40">

                    <form onSubmit={uploadDocument} className="space-y-6">

                        {/* Upload Area */}
                        <div className="relative group">
                            <input
                                type="file"
                                id="doc-upload"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {!previewUrl ? (
                                <label
                                    htmlFor="doc-upload"
                                    className="upload-zone w-full h-64 rounded-2xl flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-zinc-500 mb-4 group-hover:text-cyan-500 group-hover:scale-110 transition-all">
                                        <UploadCloud size={32} />
                                    </div>
                                    <span className="text-sm font-bold text-white tracking-wide">CLICK TO UPLOAD</span>
                                    <span className="text-xs text-zinc-500 mt-2">JPG, PNG or WEBP (Max 5MB)</span>
                                </label>
                            ) : (
                                <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-lg tracking-widest hover:bg-red-500"
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/30 text-cyan-400 text-xs font-mono flex items-center gap-2">
                                        <FileBadge size={12} /> PREVIEW READY
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        {!previewUrl && (
                            <div className="flex items-start gap-3 p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-xl">
                                <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Please ensure the photo is clear, well-lit, and all text is readable. Blurred documents will be rejected.
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !selectedFile}
                            className={`w-full py-4 rounded-xl font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all ${loading || !selectedFile
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-cyan-600 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                                }`}
                        >
                            {loading ? 'VERIFYING...' : 'SUBMIT DOCUMENT'} {!loading && <ArrowRight size={16} />}
                        </button>

                    </form>
                </div>

            </motion.div>

        </div>
    );
};

export default Document;