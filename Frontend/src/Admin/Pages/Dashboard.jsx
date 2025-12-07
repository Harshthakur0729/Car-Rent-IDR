import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    TrendingUp, Users, Car, Activity, DollarSign, Calendar,
    ArrowUpRight, ArrowDownRight, Clock, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dashboardStyles = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  ::-webkit-scrollbar { display: none; }

  .glass-panel {
    background: rgba(20, 5, 5, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(220, 38, 38, 0.2);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
  }

  .stat-card {
    background: linear-gradient(145deg, rgba(30,0,0,0.6), rgba(0,0,0,0.8));
    border: 1px solid rgba(220, 38, 38, 0.1);
    transition: all 0.3s ease;
  }
  .stat-card:hover {
    border-color: rgba(220, 38, 38, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(220, 38, 38, 0.15);
  }

  .status-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.05em;
  }
  .status-booked { background: rgba(34, 211, 238, 0.2); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); }
  .status-completed { background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
  .status-cancelled { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }

  /* Custom Tooltip Style */
  .custom-tooltip {
    background: rgba(10, 10, 10, 0.95);
    border: 1px solid #dc2626;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
  }
`;

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCars: 0,
        activeBookings: 0,
        totalRevenue: 0,
        completedRides: 0,
        cancelledRides: 0
    });

    const [recentBookings, setRecentBookings] = useState([]);
    const [chartData, setChartData] = useState([]);

    const API = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("adminToken");

                const [usersRes, carsRes] = await Promise.all([
                    axios.get(`${API}/admin/getalluser`, {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true
                    }),
                    axios.get(`${API}/admin/car/all`, {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true
                    })
                ]);

                const totalCarsCount = carsRes.data.cars ? carsRes.data.cars.length : 0;

                const users = usersRes.data.user || [];
                const totalUsersCount = users.length;

                let revenue = 0;
                let activeCount = 0;
                let completedCount = 0;
                let cancelledCount = 0;
                let allBookingsList = [];

                const revenueMap = {};

                users.forEach(user => {
                    if (user.cars && user.cars.length > 0) {
                        user.cars.forEach(booking => {
                            const status = booking.status?.toLowerCase();
                            const price = Number(booking.price) || 0;

                            if (status === 'booked' || status === 'active') {
                                activeCount++;
                                revenue += price;

                                const date = new Date(booking.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                revenueMap[date] = (revenueMap[date] || 0) + price;

                            } else if (status === 'completed') {
                                completedCount++;
                                revenue += price;

                                const date = new Date(booking.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                revenueMap[date] = (revenueMap[date] || 0) + price;

                            } else if (status === 'cancelled') {
                                cancelledCount++;
                            }

                            allBookingsList.push({
                                _id: booking._id,
                                car: booking.carName,
                                number: booking.carNumber,
                                user: user.username,
                                price: booking.price,
                                status: booking.status,
                                date: booking.createdAt || new Date().toISOString()
                            });
                        });
                    }
                });

                const processedChartData = Object.keys(revenueMap).map(key => ({
                    name: key,
                    revenue: revenueMap[key]
                }));

                if (processedChartData.length === 0) {
                    processedChartData.push({ name: 'Today', revenue: 0 });
                }

                allBookingsList.sort((a, b) => new Date(b.date) - new Date(a.date));
                const top5Bookings = allBookingsList.slice(0, 5);

                setStats({
                    totalUsers: totalUsersCount,
                    totalCars: totalCarsCount,
                    activeBookings: activeCount,
                    totalRevenue: revenue,
                    completedRides: completedCount,
                    cancelledRides: cancelledCount
                });

                setChartData(processedChartData);
                setRecentBookings(top5Bookings);
                setLoading(false);

            } catch (error) {
                console.error("Dashboard Error:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [API]);

    const getStatusClass = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'booked') return 'status-booked';
        if (s === 'completed') return 'status-completed';
        return 'status-cancelled';
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

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-mono animate-pulse">INITIALIZING DASHBOARD...</div>;

    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-600 selection:text-white overflow-hidden p-6 lg:p-10 relative">
            <style>{dashboardStyles}</style>

            {/* Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto">

                {/*  HEADER  */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase mb-2 block">System Overview</span>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Admin <span className="text-zinc-600">Dashboard</span></h1>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        SYSTEM ONLINE
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                    {/* Revenue */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-900/20 text-green-500 rounded-xl border border-green-900/30"><DollarSign size={20} /></div>
                            <span className="flex items-center text-xs font-bold text-green-500 bg-green-900/10 px-2 py-1 rounded">Gross</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">${stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Total Revenue</p>
                    </motion.div>

                    {/* Active Rentals */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-900/20 text-blue-500 rounded-xl border border-blue-900/30"><Activity size={20} /></div>
                            <div className="text-right">
                                <span className="block text-xs font-bold text-zinc-400">{stats.completedRides} Completed</span>
                                <span className="block text-[10px] text-red-400">{stats.cancelledRides} Cancelled</span>
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.activeBookings}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Active Bookings</p>
                    </motion.div>

                    {/* Users */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-900/20 text-yellow-500 rounded-xl border border-yellow-900/30"><Users size={20} /></div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.totalUsers}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Registered Users</p>
                    </motion.div>

                    {/* Fleet Size */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-900/20 text-red-500 rounded-xl border border-red-900/30"><Car size={20} /></div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.totalCars}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Total Fleet</p>
                    </motion.div>
                </div>

                {/* SPLIT SECTION: CHART & ACTIVITY */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: REVENUE GRAPH (Enhanced with Recharts) */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl p-6 md:p-8 flex flex-col justify-between h-[400px] md:h-[450px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-red-500" /> REVENUE ANALYTICS
                            </h3>
                            <div className="flex gap-2 items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-zinc-400 font-mono">REALTIME</span>
                            </div>
                        </div>

                        {/* Recharts Container */}
                        <div className="w-full h-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#71717a"
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#71717a"
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        activeDot={{ r: 6, fill: '#fff', stroke: '#ef4444', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* RIGHT: RECENT BOOKINGS (Real Data) */}
                    <div className="lg:col-span-1 glass-panel rounded-2xl p-6 h-[400px] md:h-[450px] overflow-hidden flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-4 flex items-center gap-2 flex-shrink-0">
                            <Clock size={16} className="text-red-500" /> RECENT BOOKINGS
                        </h3>
                        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {recentBookings.length > 0 ? (
                                recentBookings.map((item, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-black/40 border border-zinc-800 hover:border-red-900/50 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-sm font-bold text-white block group-hover:text-red-400 transition-colors">{item.car}</span>
                                                <span className="text-[10px] text-zinc-500 font-mono">{item.number}</span>
                                            </div>
                                            <span className={`status-badge ${getStatusClass(item.status)}`}>{item.status}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-zinc-400 font-mono">{item.user}</span>
                                            <span className="text-xs font-bold text-white">${item.price}</span>
                                        </div>
                                        <div className="mt-2 text-[9px] text-zinc-600 text-right">
                                            {new Date(item.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-zinc-600 py-20 text-xs flex flex-col items-center">
                                    <Clock size={32} className="mb-2 opacity-20" />
                                    No recent activity found
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div onClick={() => navigate('/admin/car')} className="glass-panel p-6 rounded-2xl flex items-center justify-between cursor-pointer group hover:border-red-500/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-800 group-hover:text-red-500 group-hover:border-red-500/30 transition-all">
                                <Car size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Manage Fleet</h3>
                                <p className="text-xs text-zinc-500">Add, edit or remove vehicles</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>

                    <div onClick={() => navigate('/admin/user/manage')} className="glass-panel p-6 rounded-2xl flex items-center justify-between cursor-pointer group hover:border-red-500/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-800 group-hover:text-red-500 group-hover:border-red-500/30 transition-all">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Manage Users</h3>
                                <p className="text-xs text-zinc-500">Verify documents & accounts</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;