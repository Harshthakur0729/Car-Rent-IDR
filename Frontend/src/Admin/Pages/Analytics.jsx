import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, DollarSign, Activity, Calendar, PieChart,
    BarChart2, ArrowUpRight, ArrowDownRight, Filter, Download, UserPlus, CheckCircle, FileSpreadsheet, X
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Pie, PieChart as RePieChart
} from 'recharts';

const analyticsStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 5, 5, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.2);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
  }

  .glass-card {
    background: linear-gradient(145deg, rgba(30,0,0,0.6), rgba(0,0,0,0.8));
    border: 1px solid rgba(220, 38, 38, 0.1);
    transition: all 0.3s ease;
  }
  .glass-card:hover {
    border-color: rgba(220, 38, 38, 0.4);
    transform: translateY(-2px);
  }

  .glass-modal-success {
    background: rgba(5, 20, 10, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(34, 197, 94, 0.4);
    box-shadow: 0 0 50px rgba(34, 197, 94, 0.2);
  }

  /* Custom Tooltip for Recharts */
  .custom-tooltip {
    background-color: rgba(10, 10, 10, 0.9);
    border: 1px solid rgba(220, 38, 38, 0.3);
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0,0,0,0.8);
  }
`;

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('Month'); // 'Week', 'Month', 'Year'
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);

    const [kpi, setKpi] = useState({
        revenue: 0,
        bookings: 0,
        active: 0,
        avgPrice: 0
    });

    const [revenueChartData, setRevenueChartData] = useState([]);
    const [popularityChartData, setPopularityChartData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    const API = import.meta.env.VITE_BACKEND_URL;


    const COLORS = ['#06b6d4', '#ef4444', '#22c55e', '#eab308', '#a855f7'];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("adminToken");

                const res = await axios.get(`${API}/admin/getalluser`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });

                const users = res.data.user || [];

                let totalRev = 0;
                let totalBookings = 0;
                let activeCount = 0;

                const revenueMap = {};
                const carCountMap = {};
                const activityLog = [];

                users.forEach(user => {
                    if (user.createdAt) {
                        activityLog.push({
                            type: 'user',
                            text: `New User: ${user.username}`,
                            time: new Date(user.createdAt),
                            id: user._id
                        });
                    }

                    if (user.cars && user.cars.length > 0) {
                        user.cars.forEach(b => {
                            // 1. Revenue & KPI Logic
                            if (b.status !== 'cancelled') {
                                const price = Number(b.price) || 0;
                                totalRev += price;
                                totalBookings++;

                                const dateKey = new Date(b.createdAt || b.startTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                revenueMap[dateKey] = (revenueMap[dateKey] || 0) + price;

                                // Fleet Popularity Logic
                                if (b.carName) {
                                    const carName = b.carName.split(' ').slice(0, 2).join(' '); // Simplify name
                                    carCountMap[carName] = (carCountMap[carName] || 0) + 1;
                                }
                            }

                            // Active Count
                            if (b.status === 'booked' || b.status === 'active') {
                                activeCount++;
                            }

                            // Add Booking Activity
                            activityLog.push({
                                type: 'booking',
                                text: `Booking: ${b.carName}`,
                                time: new Date(b.createdAt || b.startTime || Date.now()),
                                status: b.status,
                                id: b._id
                            });
                        });
                    }
                });

                const processedRevenue = Object.keys(revenueMap).map(key => ({
                    name: key,
                    uv: revenueMap[key],
                    amt: revenueMap[key]
                }));

                const processedPopularity = Object.keys(carCountMap)
                    .map(key => ({ name: key, value: carCountMap[key] }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 4);

                if (processedRevenue.length === 0) {
                    processedRevenue.push({ name: 'Today', uv: 0, amt: 0 });
                }

                const sortedActivity = activityLog
                    .sort((a, b) => b.time - a.time)
                    .slice(0, 5);

                setKpi({
                    revenue: totalRev,
                    bookings: totalBookings,
                    active: activeCount,
                    avgPrice: totalBookings > 0 ? Math.round(totalRev / totalBookings) : 0
                });

                setRevenueChartData(processedRevenue);
                setPopularityChartData(processedPopularity);
                setRecentActivity(sortedActivity);

            } catch (error) {
                console.error("Analytics Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [API]);

    const downloadDetails = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.get(`${API}/admin/send-excel-email`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setIsDownloadOpen(true);
        } catch (error) {
            console.error("Download error:", error);
            alert('Failed to send export email.');
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="text-zinc-400 text-xs mb-1">{label}</p>
                    <p className="text-red-500 font-bold text-sm">
                        Revenue: <span className="text-white">${payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono animate-pulse">COMPUTING ANALYTICS...</div>;

    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden p-4 md:p-6 lg:p-10 relative">
            <style>{analyticsStyles}</style>

            {/* Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto pb-20">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <span className="text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">Business Intelligence</span>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">Performance <span className="text-zinc-600">Metrics</span></h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex w-full sm:w-auto justify-center">
                            {['Week', 'Month', 'Year'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded transition-all ${timeRange === range ? 'bg-cyan-900/30 text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={downloadDetails}
                            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors w-full sm:w-auto flex items-center justify-center"
                            title="Export Report"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {/* Total Revenue */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-green-900/20 text-green-500 rounded-lg"><DollarSign size={20} /></div>
                            <span className="flex items-center text-[10px] font-bold text-green-500 bg-green-900/10 px-2 py-1 rounded">+14.5%</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-1">${kpi.revenue.toLocaleString()}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Total Revenue</p>
                    </motion.div>

                    {/* Total Bookings */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-900/20 text-blue-500 rounded-lg"><Calendar size={20} /></div>
                            <span className="flex items-center text-[10px] font-bold text-blue-500 bg-blue-900/10 px-2 py-1 rounded">+5 New</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-1">{kpi.bookings}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Total Bookings</p>
                    </motion.div>

                    {/* Active Fleet */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-cyan-900/20 text-cyan-500 rounded-lg"><Activity size={20} /></div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-1">{kpi.active}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Active Rentals</p>
                    </motion.div>

                    {/* Avg Order Value */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-purple-900/20 text-purple-500 rounded-lg"><TrendingUp size={20} /></div>
                            <span className="flex items-center text-[10px] font-bold text-red-500 bg-red-900/10 px-2 py-1 rounded">-2.4%</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-1">${kpi.avgPrice}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Avg. Ticket Size</p>
                    </motion.div>
                </div>

                {/* CHARTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Main Area Chart */}
                    <div className="lg:col-span-2 glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base"><TrendingUp size={18} className="text-cyan-500" /> Revenue Trend</h3>
                        </div>
                        <div className="flex-1 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueChartData.length > 0 ? revenueChartData : [{ name: 'No Data', uv: 0 }]}>
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#52525b" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#52525b" tick={{ fontSize: 10 }} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                    <Area type="monotone" dataKey="uv" stroke="#06b6d4" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart / Alerts Split */}
                    <div className="lg:col-span-1 flex flex-col gap-6">

                        {/* Fleet Popularity */}
                        <div className="glass-panel p-6 rounded-2xl flex-1 min-h-[250px] flex flex-col">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm md:text-base"><BarChart2 size={18} className="text-red-500" /> Fleet Popularity</h3>
                            {popularityChartData.length > 0 ? (
                                <>
                                    <div className="flex-1 w-full min-h-[150px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={popularityChartData}>
                                                <XAxis dataKey="name" hide />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff' }} />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {popularityChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                        {popularityChartData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-1 text-[10px] text-zinc-400">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                {entry.name}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-zinc-600 text-xs">No booking data available</div>
                            )}
                        </div>

                        {/* Recent Alerts */}
                        <div className="glass-panel p-6 rounded-2xl flex-1 h-64 overflow-y-auto custom-scrollbar">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm md:text-base sticky top-0 bg-[#140505] pb-2 z-10 border-b border-zinc-800"><Activity size={18} className="text-green-500" /> Recent Activity</h3>
                            <div className="space-y-3">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((act, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded border border-zinc-800">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {act.type === 'user' ? <UserPlus size={12} className="text-blue-400 flex-shrink-0" /> : <CheckCircle size={12} className="text-green-400 flex-shrink-0" />}
                                                <span className="text-xs text-zinc-300 truncate">{act.text}</span>
                                            </div>
                                            <span className="text-[9px] font-mono text-zinc-500 flex-shrink-0 ml-2">{act.time.toLocaleDateString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-zinc-600 text-xs pt-10">No recent activity</div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            {/* DOWNLOAD SUCCESS MODAL */}
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

export default Analytics;