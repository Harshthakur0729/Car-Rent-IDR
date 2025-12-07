import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Upload, Video as VideoIcon, Save, Edit, X, PlayCircle, Plus, FileVideo, Lock } from "lucide-react";

const VideoManager = () => {
    const [videos, setVideos] = useState([]);
    const [mainVideoFile, setMainVideoFile] = useState(null);
    const [subVideoFiles, setSubVideoFiles] = useState([]); 
    
    const [uploadProgress, setUploadProgress] = useState(0);

    const [mainPreview, setMainPreview] = useState(null);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const mainInputRef = useRef(null);
    const subInputRef = useRef(null);

    const API = import.meta.env.VITE_BACKEND_URL;

    const isLocked = !editId && videos.length > 0;

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${API}/dynamic/get/video`);
            setVideos(res.data.data || []);
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error("Fetch error:", error);
                toast.error("Failed to load videos");
            } else {
                setVideos([]);
            }
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    //  🔒 LOCK CHECKER FUNCTION 
    const handleLockCheck = (e) => {
        if (isLocked) {
            e.preventDefault(); // Click hone se roko (File manager open nahi hoga)
            toast.error("You cannot upload new data. You can only edit the existing old data.", {
                duration: 4000,
                icon: '🔒',
                style: {
                    border: '1px solid #FF0000',
                    padding: '16px',
                    color: '#FF0000',
                    fontWeight: 'bold',
                    background: '#222'
                }
            });
        }
    };

    const handleMainFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("video/")) {
            setMainVideoFile(file);
            setMainPreview(URL.createObjectURL(file));
            toast.success("Main Video Selected!");
        } else {
            toast.error("Invalid Main Video File");
        }
    };

    const handleSubFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.type.startsWith("video/"));

        if (validFiles.length > 0) {
            setSubVideoFiles(validFiles);
            toast.success(`${validFiles.length} Sub-videos selected!`);
        } else {
            toast.error("No valid video files selected");
        }
    };

    const resetForm = () => {
        setMainVideoFile(null);
        setSubVideoFiles([]);
        setMainPreview(null);
        setEditId(null);
        setUploadProgress(0); 
        if (mainInputRef.current) mainInputRef.current.value = "";
        if (subInputRef.current) subInputRef.current.value = "";
    };

    const handleEdit = (video) => {
        setEditId(video._id);
        setMainPreview(video.main); 
        setMainVideoFile(null);
        setSubVideoFiles([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast("Edit Mode Enabled", { icon: "✏️", style: { background: '#333', color: '#fff' } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLocked) {
            handleLockCheck(e);
            return;
        }

        if (!editId && !mainVideoFile) {
            return toast.error("Main Video is required for new upload.");
        }

        setLoading(true);
        setUploadProgress(0);
        const toastId = toast.loading("Uploading Videos... Do not close.");

        try {
            const formData = new FormData();

            if (mainVideoFile) {
                formData.append("main", mainVideoFile);
            }

            if (subVideoFiles.length > 0) {
                subVideoFiles.forEach((file) => {
                    formData.append("subVideo", file);
                });
            }

            const config = {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            };

            let res;
            if (editId) {
                res = await axios.put(`${API}/dynamic/update/video/${editId}`, formData, config);
            } else {
                res = await axios.post(`${API}/dynamic/create/video`, formData, config);
            }

            toast.success(res.data.message || "Success!");
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            toast.dismiss(toastId);
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 uppercase tracking-tighter">
                        {editId ? "Update Video" : "Video Manager"}
                    </h1>
                    <p className="text-neutral-500 mt-2">Manage Main & Sub Videos</p>
                </div>

                {/*  UPLOAD FORM  */}
                <div className={`bg-neutral-950 border border-neutral-800 rounded-2xl p-6 md:p-10 shadow-2xl shadow-red-900/10 mb-16 relative overflow-hidden transition-all ${isLocked ? 'opacity-80' : 'opacity-100'}`}>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl -z-0"></div>

                    {/* LOCK BADGE */}
                    {isLocked && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-900/30 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-900/50 z-20">
                            <Lock size={12} /> CREATION LOCKED
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="relative z-10 grid md:grid-cols-2 gap-8">

                        {/* Left Column: Inputs */}
                        <div className="space-y-6">

                            {/* Main Video Input */}
                            <div onClick={handleLockCheck} className={isLocked ? "cursor-not-allowed" : ""}>
                                <label className="text-sm font-bold text-red-500 mb-2 block uppercase">Main Video {isLocked ? "(Locked)" : "(Required)"}</label>
                                <label className={`block w-full h-32 bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center transition-all group ${isLocked ? 'cursor-not-allowed hover:border-neutral-700' : 'cursor-pointer hover:border-red-600 hover:bg-neutral-800'}`}>
                                    <Upload className={`mb-2 ${isLocked ? "text-neutral-600" : "text-neutral-500 group-hover:text-red-500"}`} size={30} />
                                    <span className={`text-sm ${isLocked ? "text-neutral-600" : "text-neutral-400 group-hover:text-white"}`}>Select Main Video</span>
                                    <input 
                                        type="file" 
                                        name="main" 
                                        accept="video/*" 
                                        onChange={handleMainFileChange} 
                                        className="hidden" 
                                        ref={mainInputRef} 
                                        disabled={isLocked} // Disable input itself
                                    />
                                </label>
                                {mainVideoFile && <p className="text-xs text-green-500 mt-1 truncate font-mono">{mainVideoFile.name}</p>}
                            </div>

                            {/* Sub Videos Input */}
                            <div onClick={handleLockCheck} className={isLocked ? "cursor-not-allowed" : ""}>
                                <label className="text-sm font-bold text-red-500 mb-2 block uppercase">Sub Videos {isLocked ? "(Locked)" : "(Optional)"}</label>
                                <label className={`block w-full h-24 bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center transition-all group ${isLocked ? 'cursor-not-allowed hover:border-neutral-700' : 'cursor-pointer hover:border-blue-500 hover:bg-neutral-800'}`}>
                                    <Plus className={`mb-2 ${isLocked ? "text-neutral-600" : "text-neutral-500 group-hover:text-blue-500"}`} size={24} />
                                    <span className={`text-sm ${isLocked ? "text-neutral-600" : "text-neutral-400 group-hover:text-white"}`}>Select Multiple Sub-Videos</span>
                                    <input 
                                        type="file" 
                                        name="subVideo" 
                                        accept="video/*" 
                                        multiple 
                                        onChange={handleSubFilesChange} 
                                        className="hidden" 
                                        ref={subInputRef}
                                        disabled={isLocked} 
                                    />
                                </label>
                                
                                {subVideoFiles.length > 0 && (
                                    <div className="mt-3 space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                                        <p className="text-xs text-blue-500 font-bold mb-1">{subVideoFiles.length} files selected:</p>
                                        {subVideoFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 p-1 rounded px-2">
                                                <FileVideo size={12} />
                                                <span className="truncate">{file.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {loading && (
                                <div className="w-full bg-neutral-800 rounded-full h-4 overflow-hidden border border-neutral-700 relative">
                                    <div 
                                        className="bg-gradient-to-r from-red-600 to-red-400 h-4 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                                        {uploadProgress}%
                                    </span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="submit"
                                    onClick={handleLockCheck} 
                                    disabled={loading} 
                                    className={`flex-1 py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                                    ${loading ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" : 
                                      isLocked ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700" : // Locked Style
                                      "bg-red-600 hover:bg-red-700 text-white hover:shadow-red-600/40 hover:scale-[1.02]"}`}
                                >
                                    {loading ? "Uploading..." : isLocked ? <><Lock size={18}/> Creation Locked</> : <><Save size={20} /> {editId ? "Update" : "Upload"}</>}
                                </button>

                                {editId && (
                                    <button type="button" onClick={resetForm} className="px-6 py-4 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Preview */}
                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-bold text-neutral-500 uppercase">Main Preview</p>
                            <div className="bg-neutral-900 rounded-xl p-2 border border-neutral-800 h-full min-h-[250px] flex items-center justify-center relative overflow-hidden">
                                {mainPreview ? (
                                    <video src={mainPreview} controls className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <div className="text-neutral-600 flex flex-col items-center">
                                        <PlayCircle size={48} className="mb-2 opacity-50" />
                                        <p>No Video Selected</p>
                                    </div>
                                )}
                                {editId && !mainVideoFile && (
                                    <div className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                                        Current Video
                                    </div>
                                )}
                            </div>
                        </div>

                    </form>
                </div>

                {/*  VIDEO LIST  */}
                <div>
                    <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3 border-l-4 border-red-600 pl-4">
                        Uploaded Content <span className="text-sm font-normal text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full">{videos.length}</span>
                    </h2>

                    <div className="grid grid-cols-1 gap-8">
                        {videos.map((vid) => (
                            <div key={vid._id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-red-600/30 transition-all shadow-xl p-6">

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-red-500 font-bold text-sm tracking-wider">VIDEO ID: {vid._id.slice(-6)}</span>
                                    <button onClick={() => handleEdit(vid)} className="px-4 py-2 bg-neutral-800 hover:bg-white hover:text-black rounded-lg text-sm transition-colors flex items-center gap-2">
                                        <Edit size={14} /> Edit
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <p className="text-xs text-neutral-500 uppercase font-bold">Main Video</p>
                                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-neutral-800">
                                            <video src={vid.main} controls className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs text-neutral-500 uppercase font-bold flex justify-between">
                                            Sub Videos <span>{vid.subVideo?.length || 0}</span>
                                        </p>
                                        <div className="h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                            {vid.subVideo && vid.subVideo.length > 0 ? (
                                                vid.subVideo.map((sub, idx) => (
                                                    <div key={idx} className="bg-black rounded-lg overflow-hidden border border-neutral-800">
                                                        <video src={sub} controls className="w-full h-32 object-cover" />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-neutral-600 text-sm text-center py-10">No sub-videos</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}

                        {videos.length === 0 && (
                            <div className="text-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                                No videos uploaded yet.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VideoManager;