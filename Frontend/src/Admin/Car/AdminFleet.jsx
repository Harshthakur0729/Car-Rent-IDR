import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Plus, Edit, Trash2, X, Search, CheckCircle, AlertCircle, Fuel, Users, Wind, ShieldCheck, Upload,
  Eye, Calendar, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';

const fleetStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  /* Hide scrollbar for gallery but allow scrolling */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .glass-panel {
    background: rgba(20, 5, 5, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.2);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
  }

  .glass-modal {
    background: rgba(10, 0, 0, 0.98);
    border: 1px solid rgba(220, 38, 38, 0.4);
    box-shadow: 0 0 50px rgba(220, 38, 38, 0.2);
  }

  .glass-modal-danger {
    background: rgba(25, 0, 0, 0.98);
    border: 2px solid rgba(220, 38, 38, 0.6);
    box-shadow: 0 0 80px rgba(220, 38, 38, 0.4);
  }

  .input-field {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    transition: all 0.3s ease;
  }
  .input-field:focus {
    border-color: #dc2626;
    outline: none;
    box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
  }
  
  .sticky-header {
    position: sticky;
    top: 0;
    background: rgba(10, 0, 0, 0.98);
    z-index: 10;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(220, 38, 38, 0.2);
  }

  input[type="file"] { display: none; }
  
  .custom-file-upload {
    display: flex; flex-direction: column; align-items: center; justify-content: center; 
    padding: 20px; border: 2px dashed rgba(220, 38, 38, 0.5); border-radius: 8px; 
    cursor: pointer; transition: all 0.3s; background: rgba(0,0,0,0.3);
  }
  .custom-file-upload:hover { background: rgba(220, 38, 38, 0.1); border-color: #dc2626; }
`;

const AdminFleet = () => {
  //  STATE 
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewCar, setViewCar] = useState(null);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [carToDeleteId, setCarToDeleteId] = useState(null);

  const [modalMode, setModalMode] = useState('create');
  const [currentCarId, setCurrentCarId] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  // Form & Images
  const initialFormState = { 
    name: '', 
    brand: '', 
    carnumber: '', 
    year: '', 
    type: '', 
    color: '', 
    seats: '', 
    fuelType: 'Petrol', 
    price: '', 
    description: '', 
    AC: true, 
    GPS: false, 
    musicSystem: true, 
    airbags: true, 
    sunroof: false 
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Scroll Ref for Gallery
  const galleryRef = useRef(null);

   const API = import.meta.env.VITE_BACKEND_URL;

  //  FETCH CARS 
  const fetchCars = async () => {
    setLoading(true);
    try {
      const token =  localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/car/all`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setCars(res.data.cars || []);
    } catch (error) {
      console.error("Fetch error:", error);
      showAlert('error', 'Failed to load fleet data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCars(); }, []);

  //  HELPERS 
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 8) return showAlert('error', 'Maximum 8 images allowed!');
    setSelectedFiles([...selectedFiles, ...files]);
    setPreviews([...previews, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  //  GALLERY SCROLL LOGIC 
  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const { current } = galleryRef;
      const scrollAmount = current.clientWidth;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  //  MODAL HANDLERS 
  const openModal = (mode, car = null) => {
    setModalMode(mode);
    if (mode === 'edit' && car) {
      setCurrentCarId(car._id);
      const { images, ...rest } = car;
      setFormData(rest);
      setPreviews(car.images || []);
      setSelectedFiles([]);
    } else {
      setFormData(initialFormState);
      setSelectedFiles([]);
      setPreviews([]);
    }
    setIsModalOpen(true);
  };

  const openViewModal = (car) => {
    setViewCar(car);
    setIsViewOpen(true);
  };

  //  API ACTIONS 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token =  localStorage.getItem("adminToken");
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    selectedFiles.forEach(file => data.append('car_image', file));

    try {
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }, withCredentials: true };
      if (modalMode === 'create') {
        await axios.post(`${API}/admin/car/create`, data, config);
        showAlert('success', 'New Vehicle Added.');
      } else {
        await axios.put(`${API}/admin/car/update/${currentCarId}`, data, config);
        showAlert('success', 'Vehicle Updated.');
      }
      setIsModalOpen(false);
      fetchCars();
    } catch (error) {
      console.error("Submit Error:", error);
      showAlert('error', error.response?.data?.message || 'Operation Failed.');
    }
  };

  const initiateDelete = (id) => {
    setCarToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token =  localStorage.getItem("adminToken");
      await axios.delete(`${API}/admin/car/delete/${carToDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      showAlert('success', 'Vehicle Removed.');
      fetchCars();
    } catch (error) {
      showAlert('error', 'Failed to delete vehicle.');
    } finally {
      setIsDeleteModalOpen(false);
      setCarToDeleteId(null);
    }
  };

  const filteredCars = cars.filter(car => car.name.toLowerCase().includes(searchTerm.toLowerCase()) || car.brand.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderInput = (label, name, type = "text", required = true, colSpan = 1) => (
    <div className={colSpan === 2 ? "col-span-1 md:col-span-2" : "col-span-1"}>
      <label className="text-[10px] font-bold text-red-500 tracking-widest block mb-1">{label}</label>
      <input type={type} name={name} value={formData[name]} onChange={handleInputChange} className="w-full p-3 rounded-lg input-field text-sm" required={required} />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-600 selection:text-white relative pt-20 pb-20 px-4 md:px-8">
      <style>{fleetStyles}</style>

      {/* ALERT */}
      <AnimatePresence>{alert.show && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-24 right-4 md:right-6 z-[100] px-6 py-3 rounded-lg border flex items-center gap-3 shadow-2xl ${alert.type === 'success' ? 'bg-green-900/80 border-green-500 text-green-200' : 'bg-red-900/80 border-red-500 text-red-200'}`}>
          {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-bold text-xs tracking-widest">{alert.message}</span>
        </motion.div>
      )}</AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Admin Console</span>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">Fleet <span className="text-zinc-600">Manager</span></h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:outline-none" />
            </div>
            <button onClick={() => openModal('create')} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all"><Plus size={16} /> Add Vehicle</button>
          </div>
        </div>

        {/* CAR GRID */}
        {loading ? <div className="text-center py-20 text-red-500 font-mono animate-pulse">LOADING FLEET DATA...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <motion.div key={car._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl overflow-hidden group hover:border-red-500/50 transition-all cursor-pointer" onClick={() => openViewModal(car)}>
                <div className="h-48 relative bg-zinc-900 overflow-hidden">
                  <img src={car.images?.[0] || "https://via.placeholder.com/400x300"} alt={car.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute top-3 right-3 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openViewModal(car)} className="p-2 bg-black/50 hover:bg-green-600 text-white rounded-full backdrop-blur-md transition-all"><Eye size={14}/></button>
                    <button onClick={() => openModal('edit', car)} className="p-2 bg-black/50 hover:bg-blue-600 text-white rounded-full backdrop-blur-md transition-all"><Edit size={14}/></button>
                    <button onClick={() => initiateDelete(car._id)} className="p-2 bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all"><Trash2 size={14}/></button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{car.type}</div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="overflow-hidden"><h3 className="text-lg font-black text-white italic uppercase truncate">{car.name}</h3><p className="text-xs text-red-500 font-mono">{car.brand} • {car.year}</p></div>
                    <span className="text-xl font-bold text-white flex-shrink-0">${car.price}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1"><Fuel size={12} className="text-red-500"/> {car.fuelType}</span>
                    <span className="flex items-center gap-1"><Users size={12} className="text-red-500"/> {car.seats} Seats</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/*  VIEW DETAILS MODAL  */}
      <AnimatePresence>
        {isViewOpen && viewCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-modal w-full max-w-3xl rounded-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar p-0 mx-4 md:mx-0">
              <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 z-50 bg-black/50 rounded-full p-2 text-white hover:bg-red-600 transition-all"><X size={24}/></button>
              
              {/* Image Gallery */}
              <div className="w-full h-64 md:h-80 bg-black relative group">
                 
                 <button className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100" onClick={() => scrollGallery('left')}>
                    <ChevronLeft size={24} />
                 </button>
                 <button className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100" onClick={() => scrollGallery('right')}>
                    <ChevronRight size={24} />
                 </button>

                 <div ref={galleryRef} className="flex overflow-x-auto snap-x snap-mandatory h-full w-full no-scrollbar">
                    {viewCar.images && viewCar.images.length > 0 ? viewCar.images.map((img, idx) => (
                       <div key={idx} className="snap-center shrink-0 w-full h-full">
                          <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                       </div>
                    )) : (
                       <div className="w-full h-full flex items-center justify-center text-zinc-500">NO IMAGES AVAILABLE</div>
                    )}
                 </div>
                 
                 <div className="md:hidden absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-mono">SWIPE &rarr;</div>
                 <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                    {viewCar.images?.length || 0} PHOTOS
                 </div>
              </div>

              {/* Details Content */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start border-b border-zinc-800 pb-6 mb-6 gap-4">
                   <div>
                      <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase leading-none mb-2">{viewCar.name}</h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 bg-red-900/30 text-red-400 text-xs font-bold rounded border border-red-900/50 uppercase">{viewCar.brand}</span>
                        <span className="text-zinc-500 font-mono text-sm uppercase">{viewCar.type}</span>
                        <span className="text-zinc-500 font-mono text-sm uppercase border-l border-zinc-700 pl-3">{viewCar.carnumber || 'N/A'}</span>
                      </div>
                   </div>
                   <div className="text-left md:text-right mt-2 md:mt-0">
                      <span className="block text-3xl md:text-4xl font-black text-white">${viewCar.price}</span>
                      <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">RATE PER DAY</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                   <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50"><p className="text-[10px] text-red-500 font-bold tracking-widest mb-1">YEAR</p><p className="text-white font-bold">{viewCar.year}</p></div>
                   <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50"><p className="text-[10px] text-red-500 font-bold tracking-widest mb-1">FUEL</p><p className="text-white font-bold">{viewCar.fuelType}</p></div>
                   <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50"><p className="text-[10px] text-red-500 font-bold tracking-widest mb-1">SEATS</p><p className="text-white font-bold">{viewCar.seats}</p></div>
                   <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50"><p className="text-[10px] text-red-500 font-bold tracking-widest mb-1">COLOR</p><p className="text-white font-bold uppercase">{viewCar.color || 'N/A'}</p></div>
                </div>

                <div className="mb-8">
                   <h3 className="text-xs font-bold text-zinc-500 tracking-widest uppercase mb-3">Vehicle Description</h3>
                   <p className="text-sm text-zinc-300 leading-relaxed font-light">{viewCar.description}</p>
                </div>

                <div>
                   <h3 className="text-xs font-bold text-zinc-500 tracking-widest uppercase mb-3">Features & Specs</h3>
                   <div className="flex flex-wrap gap-2">
                      {['AC', 'GPS', 'musicSystem', 'airbags', 'sunroof'].filter(k => viewCar[k]).map(feat => (
                         <span key={feat} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 font-bold uppercase flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-500"/> {feat}
                         </span>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*  DELETE CONFIRMATION MODAL  */}
      <AnimatePresence>{isDeleteModalOpen && (<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-modal-danger w-full max-w-sm rounded-3xl p-8 relative overflow-hidden text-center"><div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border-2 border-red-600 animate-pulse"><AlertTriangle size={32} /></div><h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Confirm Deletion</h2><p className="text-zinc-300 text-xs mb-6 font-mono leading-relaxed">Are you sure you want to remove this vehicle from the fleet? This action cannot be undone.</p><div className="flex gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold tracking-widest transition-all">CANCEL</button><button onClick={confirmDelete} className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest transition-all shadow-lg shadow-red-900/40">DELETE</button></div></motion.div></div>)}</AnimatePresence>
      
      {/*  ADD / EDIT MODAL  */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-modal w-full max-w-2xl rounded-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar mx-4 md:mx-0">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-20 bg-black/50 rounded-full p-1"><X size={20}/></button>
                    
                    <div className="sticky-header px-6 md:px-8 pt-8 mb-6">
                        <h2 className="text-xl md:text-2xl font-black italic text-white uppercase">{modalMode === 'create' ? 'Add New Machine' : 'Modify Vehicle Data'}</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5 px-6 md:px-8 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput('CAR NAME', 'name')} 
                            {renderInput('BRAND', 'brand')} 
                            {renderInput('CAR NUMBER', 'carnumber')} 
                            {renderInput('PRICE PER DAY', 'price', 'number')} 
                            {renderInput('YEAR', 'year')}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {renderInput('TYPE', 'type')} 
                            {renderInput('COLOR', 'color', 'text', false)} 
                            {renderInput('SEATS', 'seats', 'text', false)}
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-red-500 tracking-widest block mb-1">FUEL TYPE</label>
                            <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} className="w-full p-3 rounded-lg input-field text-sm bg-black">
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-red-500 tracking-widest block mb-1">DESCRIPTION</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-3 rounded-lg input-field text-sm" required></textarea>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-black/30 p-4 rounded-xl border border-zinc-800">
                            {['AC', 'GPS', 'musicSystem', 'airbags', 'sunroof'].map((f) => (
                                <label key={f} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name={f} checked={formData[f]} onChange={handleInputChange} className="accent-red-600 w-4 h-4" />
                                    <span className="text-xs font-bold text-zinc-300 uppercase">{f}</span>
                                </label>
                            ))}
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-red-500 tracking-widest block mb-2">IMAGES (Max 8)</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {previews.map((url, i) => (
                                    <div key={i} className="relative h-24 bg-zinc-900 rounded-lg border border-zinc-800 group">
                                        <img src={url} alt="Preview" className="w-full h-full object-cover rounded-lg opacity-80" />
                                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                    </div>
                                ))}
                                {previews.length < 8 && (
                                    <label className="custom-file-upload h-24 flex flex-col items-center justify-center text-zinc-500 hover:text-red-500">
                                        <Upload size={24} className="mb-2"/>
                                        <span className="text-[9px] font-bold">UPLOAD</span>
                                        <input type="file" accept="image/*" multiple onChange={handleFileSelect} />
                                    </label>
                                )}
                            </div>
                            <p className="text-[9px] text-zinc-600 text-right">{previews.length} / 8 IMAGES SELECTED</p>
                        </div>
                        
                        <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-[0.2em] uppercase rounded-lg shadow-lg shadow-red-900/30 transition-all">{modalMode === 'create' ? 'INITIALIZE CAR' : 'SAVE CHANGES'}</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFleet;