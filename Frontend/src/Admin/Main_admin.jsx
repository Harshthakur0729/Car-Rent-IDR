import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './Template/Sidebar';

const Main_admin = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">

            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className={`transition-all duration-300 ease-in-out min-h-screen ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
                <div className="p-6 lg:p-10">
                    <Outlet />
                </div>
            </div>
        </div >
    );
};

export default Main_admin;