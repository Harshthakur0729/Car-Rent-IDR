import React, { useEffect, useState } from 'react';
import { Menu, X, LayoutDashboard, Users, BarChart3, Settings, HeartHandshake, LogOut, UserStar, FolderClosed, CarFront, Codesandbox, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const sidebarStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;




const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.get(`${API}/admin/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminToken")
      navigate('/login');
    }
  };

  const API = import.meta.env.VITE_BACKEND_URL;
  const [datas, setDatas] = useState({});

  useEffect(() => {
     const token = localStorage.getItem("adminToken");
    if (!token) {
      console.log("No token found");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/admin/profile`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDatas(res.data.admin);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchData();
  }, []);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => location.pathname === path;

  const customOptions = [
    {
      text: "Car Details ",
      path: "/admin/car",
      icon: <FolderClosed size={18} />
    },
    {
      text: "Car Booking Manage",
      path: "/admin/car-booking-manage",
      icon: <CarFront size={18} />
    },
    {
      text: "Image,Font and logo Manage",
      path: "/admin/dynamic-Manager",
      icon: <Codesandbox size={18} />
    },
    {
      text: "Manage web video",
      path: "/admin/dynamic-manage-video",
      icon: <HelpCircle size={18} />
    },
    {
      text: "Create Sub Admin",
      path: "/admin/admin-management",
      icon: <UserStar size={18} />
    },
    {
      text: "Admin Help center",
      path: "/admin/help-center",
      icon: <HeartHandshake size={18} />
    }
  ];

  return (
    <div className="text-white relative font-sans">
      <style>{sidebarStyles}</style>

      {/*  TOGGLE BUTTON  */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-5 z-50 p-2.5 rounded-lg bg-zinc-800 text-white hover:bg-red-600 transition-all duration-300 shadow-lg border border-zinc-700 ${isOpen ? 'left-64 ml-4' : 'left-5'
          }`}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/*  OVERLAY (Mobile only)  */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/*  SIDEBAR CONTAINER  */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-[#111111] border-r border-zinc-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">

          {/* 1. ADMIN PROFILE SECTION (Clickable -> /admin/profile) */}
          <div
            onClick={() => navigate('/admin/profile')}
            className="pt-20 pb-8 px-6 text-center border-b border-zinc-800 bg-[#161616] cursor-pointer hover:bg-zinc-900 transition-colors group"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={datas.profileImage}
                alt="Admin"
                className="w-full h-full rounded-full object-cover border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] group-hover:scale-105 transition-transform"
              />
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border border-[#161616] 
  ${datas?.Isadmin ? "bg-green-500 animate-pulse" : "bg-zinc-600 animate-pulse"}`}
              ></span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-red-500 transition-colors">{datas.adminname}</h3>
            <p className="text-xs text-red-500 font-mono uppercase tracking-widest mt-1">System Administrator</p>
          </div>

          {/* 2. MENU OPTIONS */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-2">

            {/* Fixed Core Options */}
            <MenuItem
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
              onClick={() => navigate('/admin/dashboard')}
              active={isActive('/admin/dashboard') || isActive('/admin')}
            />

            <MenuItem
              icon={<Users size={20} />}
              text="Manage Users"
              onClick={() => navigate('/admin/user/manage')}
              active={isActive('/admin/user/manage')}
            />



            <MenuItem
              icon={<BarChart3 size={20} />}
              text="Analytics"
              onClick={() => navigate('/admin/analytics')}
              active={isActive('/admin/analytics')}
            />

            <MenuItem
              icon={<Settings size={20} />}
              text="Settings"
              onClick={() => navigate('/admin/profile')}
              active={isActive('/admin/profile')}
            />

            {/*  CUSTOM EXTRA OPTIONS  */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">More Options</p>

              {/* Mapping through customOptions array */}
              {customOptions.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={item.icon}
                  text={item.text}
                  onClick={() => navigate(item.path)}
                  active={isActive(item.path)}
                />
              ))}
            </div>

          </div>

          {/* 3. FOOTER SECTION */}
          <div className="p-4 border-t border-zinc-800 bg-[#161616]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold text-sm tracking-wide group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> LOGOUT
            </button>
          </div>

        </div>
      </aside>

    </div>
  );
};

// Helper Component for Menu Item
const MenuItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${active
      ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20'
      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
      }`}
  >
    <span className={`${active ? 'text-white' : 'text-zinc-500 group-hover:text-red-500'} transition-colors`}>
      {icon}
    </span>
    <span className="font-medium text-sm tracking-wide">{text}</span>
  </button>
);

export default AdminSidebar;