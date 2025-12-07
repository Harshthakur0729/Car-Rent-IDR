import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react'; // Import Trash icon for deleting individual images

const helpStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }

  .glass-panel {
    background: rgba(24, 24, 27, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .input-field {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    transition: all 0.3s ease;
  }
  .input-field:focus {
    border-color: #06b6d4;
    box-shadow: 0 0 15px rgba(6,182,212, 0.2);
    outline: none;
  }
  
  .contact-card:hover {
    border-color: #06b6d4;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(6,182,212, 0.15);
  }
`;

const Help = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        description: ''
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [status, setStatus] = useState('idle');
    const [data, setData] = useState({});

    const API = import.meta.env.VITE_BACKEND_URL;
    const Icons = {
        Mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,


        Phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,


        Instagram: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>,


        Upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>,


        Check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>,
        X: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,


        Headset: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11v3a8 8 0 0 0 16 0v-3" /><path d="M14 6a2 2 0 0 0-4 0" /><path d="M21 11v3a8 8 0 0 1-16 0v-3a8 8 0 0 1 16 0Z" /><path d="M18 11a3 3 0 0 1-6 0" /></svg>
    };

    const dataget = async () => {
        try {
            const res = await axios.get(`${API}/dynamic/get/dynamic/data`);
            if (res.data && res.data.data && res.data.data.length > 0) {
                setData(res.data.data[0]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => { dataget(); }, [])

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newFiles = [...selectedFiles, ...files];
            setSelectedFiles(newFiles);

            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newUrls]);
        }
    };

    const removeImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviewUrls(newUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("userToken");
        if (!token) {
            alert("Please login to submit a request!");
            return;
        }

        setStatus('sending');

        const submitData = new FormData();
        submitData.append("email", formData.email);
        submitData.append("phone", formData.phone);
        submitData.append("description", formData.description);

        if (selectedFiles.length > 0) {
            selectedFiles.forEach((file) => {
                submitData.append("Help", file);
            });
        }

        try {
            await axios.post(`${API}/user/help`, submitData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
                withCredentials: true
            });

            setStatus('success');
            setFormData({ email: '', phone: '', description: '' });
            // Reset files
            setSelectedFiles([]);
            setPreviewUrls([]);

            setTimeout(() => setStatus('idle'), 3000);

        } catch (error) {
            console.error("Help Request Failed:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black pt-20 md:pt-24 pb-20 relative overflow-hidden">
            <style>{helpStyles}</style>

            {/*  BACKGROUND  */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0  from-black/90 via-black/70 to-black z-10" />
                {data.helpImg && (
                    <img src={data.helpImg} alt="Support Background" className="w-full h-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none" />
            </div>

            <div className="relative z-20 max-w-4xl mx-auto px-4 md:px-6">

                {/*  HEADER  */}
                <div className="text-center mb-8 md:mb-12 animate-slide-up">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 text-cyan-400">
                        {Icons.Headset}
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-4">
                        Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Center</span>
                    </h1>
                    <p className="text-zinc-400 text-xs md:text-sm font-mono tracking-wide max-w-lg mx-auto">
                        Encountered an issue? Our elite support team is standing by 24/7.
                    </p>
                </div>

                {/*  FORM SECTION  */}
                <div className="glass-panel rounded-3xl p-6 md:p-12 mb-16 animate-slide-up delay-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-zinc-500 tracking-widest uppercase ml-1">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInput} placeholder="Enter your email" className="w-full p-4 rounded-xl input-field text-sm font-mono" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-zinc-500 tracking-widest uppercase ml-1">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInput} placeholder="+91" className="w-full p-4 rounded-xl input-field text-sm font-mono" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-zinc-500 tracking-widest uppercase ml-1">Describe Your Issue</label>
                            <textarea name="description" value={formData.description} onChange={handleInput} placeholder="Tell us how we can help..." rows="5" className="w-full p-4 rounded-xl input-field text-sm font-sans resize-none" required ></textarea>
                        </div>

                        {/*  MULTIPLE FILE UPLOAD  */}
                        <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-zinc-500 tracking-widest uppercase ml-1 flex justify-between">
                                <span>Attach Images (Optional)</span>
                                <span className="text-cyan-400">{selectedFiles.length} Files Selected</span>
                            </label>

                            <div className={`relative w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all group ${selectedFiles.length > 0 ? 'border-cyan-500' : 'border-zinc-700 hover:border-zinc-500 bg-black/30'}`}>

                                {/* Preview Grid */}
                                {previewUrls.length > 0 ? (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full mb-4">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="relative group/img h-20 rounded-lg overflow-hidden border border-zinc-600">
                                                <img src={url} alt="preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-500 opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Add More Button */}
                                        <label className="h-20 flex items-center justify-center bg-zinc-800 rounded-lg border border-zinc-700 cursor-pointer hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                                            <span className="text-2xl">+</span>
                                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>
                                ) : (
                                    // Initial State
                                    <div className="text-center p-4 pointer-events-none">
                                        <div className="text-zinc-500 mb-2 flex justify-center">{Icons.Upload}</div>
                                        <span className="text-[10px] md:text-xs text-zinc-400 font-mono">CLICK TO UPLOAD SCREENSHOTS OR PHOTOS</span>
                                    </div>
                                )}

                                {/* Hidden Input for Initial Click */}
                                {previewUrls.length === 0 && (
                                    <input
                                        type="file"
                                        multiple // Allow multiple selection
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className={`w-full py-4 rounded-xl font-bold text-sm tracking-[0.2em] uppercase transition-all shadow-lg flex items-center justify-center gap-3 ${status === 'success' ? 'bg-green-600 text-white hover:bg-green-500' :
                                status === 'error' ? 'bg-red-600 text-white hover:bg-red-500' :
                                    'bg-cyan-600 text-black hover:bg-cyan-400 shadow-cyan-500/20'
                                }`}
                        >
                            {status === 'sending' ? 'TRANSMITTING...' :
                                status === 'success' ? <>REQUEST SENT {Icons.Check}</> :
                                    status === 'error' ? <>FAILED TO SEND {Icons.X}</> :
                                        'SUBMIT REQUEST'}
                        </button>

                    </form>
                </div>

                {/*  CONTACT GRID (Same as before)  */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up delay-200">
                    <div className="contact-card glass-panel p-6 rounded-2xl text-center border border-zinc-800 transition-all duration-300">
                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400 border border-zinc-700">{Icons.Phone}</div>
                        <h3 className="text-lg font-bold text-white mb-1">Call Us</h3>
                        <h4 className="text-md font-semibold text-zinc-300 mb-1">{data.helpContactName || "Support"}</h4>
                        <p className="text-xs text-zinc-500 font-mono mb-4 break-words">{data.helpContactDescription || "Available 24/7"}</p>
                        <div className="flex flex-col gap-1">
                            {data?.helpContactNumber?.map((num, index) => (<p key={index} className="text-cyan-400 hover:text-white font-bold tracking-wide transition-colors block text-sm">{num}</p>))}
                        </div>
                    </div>
                    <div className="contact-card glass-panel p-6 rounded-2xl text-center border border-zinc-800 transition-all duration-300">
                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400 border border-zinc-700">{Icons.Mail}</div>
                        <h3 className="text-lg font-bold text-white mb-1">Email Us</h3>
                        <p className="text-xs text-zinc-500 font-mono mb-4">FOR URGENT INQUIRIES</p>
                        <p className="text-cyan-400 hover:text-white font-bold tracking-wide transition-colors text-sm break-all">{data.helpContactEmail || "support@example.com"}</p>
                    </div>
                    <div className="contact-card glass-panel p-6 rounded-2xl text-center border border-zinc-800 transition-all duration-300">
                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400 border border-zinc-700">{Icons.Instagram}</div>
                        <h3 className="text-lg font-bold text-white mb-1">Insta ID</h3>
                        <p className="text-xs text-zinc-500 font-mono mb-4">QUICK RESPONSE</p>
                        <div className="flex flex-col gap-1">
                            {data?.helpContactInstaId?.map((insta, index) => (<p key={index} className="text-cyan-400 hover:text-white font-bold tracking-wide transition-colors text-sm">@{insta}</p>))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Help;