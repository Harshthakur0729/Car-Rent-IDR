import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  MessageSquare, User, Phone, Mail, Calendar, Send, Paperclip, X, CheckCircle, Clock
} from "lucide-react";

const AdminHelpCenter = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const fileInputRef = useRef(null);
  const API = import.meta.env.VITE_BACKEND_URL;

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/get/help-message`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Fetch Error:", error);
        toast.error("Failed to load messages");
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // 2. HANDLE REPLY SUBMIT
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return toast.error("Please write a reply message.");

    setSending(true);
    const formData = new FormData();
    formData.append("description", replyText);

    // Append multiple images if selected
    if (replyFiles.length > 0) {
      Array.from(replyFiles).forEach(file => {
        formData.append("replyImages", file);
      });
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(`${API}/admin/reply-help/${selectedTicket._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (res.data.success) {
        toast.success("Reply sent & Email dispatched!");
        setReplyModalOpen(false);
        setReplyText("");
        setReplyFiles([]);
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  // Helper to open modal
  const openReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setReplyFiles([]);
    setReplyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center gap-3">
            <MessageSquare size={32} className="text-cyan-500" /> User Support Inbox
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">Manage user queries and send email responses directly.</p>
        </div>

        {/* --- MESSAGES LIST --- */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 animate-pulse">Loading messages...</div>
        ) : (
          <div className="space-y-6">

            {messages.length === 0 && (
              <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl text-neutral-500">
                No support tickets found.
              </div>
            )}

            {messages.map((ticket) => (
              <div key={ticket._id} className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all shadow-lg">

                {/* --- USER QUERY SECTION --- */}
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-500/30 text-cyan-400">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">{ticket.user.email}</h3>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                          <span className="flex items-center gap-1"><Phone size={12} /> {ticket.user.phone}</span>
                          <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${ticket.adminReply?.description ? "bg-green-900/20 text-green-500 border-green-800" : "bg-yellow-900/20 text-yellow-500 border-yellow-800"}`}>
                      {ticket.adminReply?.description ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {ticket.adminReply?.description ? "Resolved" : "Pending Reply"}
                    </div>
                  </div>

                  {/* User Message Body */}
                  <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 mb-4">
                    <p className="text-sm text-neutral-300 leading-relaxed">{ticket.user.description}</p>
                    {/* User Attached Images */}
                    {ticket.user.images && ticket.user.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {ticket.user.images.map((img, idx) => (
                          <img key={idx} src={img} alt="User attach" className="h-20 w-20 object-cover rounded-lg border border-neutral-700" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* --- ADMIN REPLY SECTION (If exists) --- */}
                  {ticket.adminReply?.description && (
                    <div className="pl-4 md:pl-8 border-l-2 border-cyan-500/30 mt-6">
                      <h4 className="text-xs font-bold text-cyan-500 uppercase mb-2 flex items-center gap-2">
                        <ShieldCheck size={14} /> Admin Response
                      </h4>
                      <p className="text-sm text-neutral-400 bg-black p-4 rounded-lg border border-neutral-800">
                        {ticket.adminReply.description}
                      </p>
                      {ticket.adminReply.images && ticket.adminReply.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {ticket.adminReply.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Admin reply" className="h-16 w-16 object-cover rounded border border-neutral-800" />
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-neutral-600 mt-2 text-right">Replied on: {new Date(ticket.adminReply.repliedAt).toLocaleString()}</p>
                    </div>
                  )}

                  {/* Action Button (Only if not replied or want to update reply) */}
                  {!ticket.adminReply?.description && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => openReplyModal(ticket)}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Send size={16} /> Send Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- REPLY MODAL --- */}
        {replyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl animate-scale-up relative overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                <h3 className="text-lg font-bold text-white">Replying to {selectedTicket?.user?.email}</h3>
                <button onClick={() => setReplyModalOpen(false)} className="text-neutral-500 hover:text-white"><X size={20} /></button>
              </div>

              {/* Form */}
              <div className="p-6">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your solution here..."
                  rows={5}
                  className="w-full bg-black border border-neutral-700 rounded-xl p-4 text-sm text-white focus:border-cyan-500 focus:outline-none resize-none mb-4"
                ></textarea>

                {/* File Input */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-lg flex items-center gap-2 border border-neutral-700 transition-colors"
                  >
                    <Paperclip size={14} /> Attach Images
                  </button>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => setReplyFiles(e.target.files)}
                  />
                  {replyFiles.length > 0 && <span className="text-xs text-green-500">{replyFiles.length} files attached</span>}
                </div>

                <button
                  onClick={handleReplySubmit}
                  disabled={sending}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${sending ? 'bg-neutral-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-black'}`}
                >
                  {sending ? "Sending Email..." : <><Send size={16} /> Send Reply</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Helper Icon for Admin Response section (Optional)
const ShieldCheck = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);

export default AdminHelpCenter;