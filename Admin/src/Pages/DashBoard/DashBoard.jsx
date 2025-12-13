import React, { useEffect, useState } from "react";
import axios from 'axios';
import { FiCalendar, FiActivity } from "react-icons/fi"; // Added for extra visual flair
import { CircularProgress } from "@mui/material";

// Components
import DashBordBox from "../../Components/DashbordBoxes/DashBordBox.jsx"; 
import OrdersList from "../Orders Pages/OrdersList.jsx"; 
import RevenueChart from "../../Components/Charts/RevenueChart.jsx";
import UserStats from "../../Components/DashbordBoxes/UserStats.jsx";
import QuickActions from "../../Components/DashbordBoxes/QuickActions.jsx";

function DashBoard() {
  const [stats, setStats] = useState({
     totalOrders: 0,
     totalRevenue: 0,
     totalProducts: 0,
     totalSellers: 0,
     totalUsers: 0,
     activeSellers: 0,
     pendingSellers: 0,
     monthlyRevenue: []
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch logic remains exactly the same
  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`);
            if(data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, []);

  // Loading State with a Colorful Spinner
  if (loading) {
    return (
        <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-4">
            <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-indigo-500 font-semibold animate-pulse">Loading Analytics...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 relative overflow-x-hidden font-sans">
      
      {/* --- DESIGN ELEMENT: Colorful Top Background --- */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 rounded-b-[40px] -z-10"></div>
      {/* decorative blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-8">
      
      {/* 1. Colorful Header Section */}
     {/* 1. Colorful Header Section */}
      <div className="relative mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold border border-white/30">
                        Admin Console
                    </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-blue-100 mt-1 text-sm font-medium opacity-90">
                    Welcome back! Track your store's colorful progress today.
                </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl">
                <div className="p-2 bg-white text-indigo-600 rounded-xl shadow-sm">
                    <FiCalendar size={20} />
                </div>
                <div className="pr-2">
                    <p className="text-xs text-blue-100 uppercase font-semibold">Today's Date</p>
                    <p className="text-sm font-bold">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Top Stats Cards (Slider) */}
      <section className="relative z-10">
         <DashBordBox />
      </section>

      {/* 3. Quick Actions Bar */}
      <section className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-2 border border-gray-100 shadow-sm">
         <div className="px-4 py-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Access</h3>
         </div>
         <QuickActions />
      </section>

      {/* 4. Charts & Activity Grid - MULTICOLOR CONTAINERS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Revenue Chart (Purple Theme) */}
        <div className="lg:col-span-2 flex flex-col">
            <div className="relative bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-1 h-full overflow-hidden group hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300">
                 {/* Top Colored Bar */}
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                 <div className="p-4">
                    <RevenueChart monthlyData={stats.monthlyRevenue} />
                 </div>
            </div>
        </div>
        
        {/* Right: User/Seller Stats (Blue/Cyan Theme) */}
        <div className="lg:col-span-1 flex flex-col">
            <div className="relative bg-white rounded-3xl shadow-xl shadow-cyan-100/50 border border-cyan-50 p-1 h-full overflow-hidden group hover:shadow-2xl hover:shadow-cyan-200/50 transition-all duration-300">
                 {/* Top Colored Bar */}
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                 <div className="p-4 h-full">
                    <UserStats stats={stats} />
                 </div>
            </div>
        </div>
      </section>

      {/* 5. Recent Orders Section (Orange/Pink Theme) */}
      <section className="pt-4">
         <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-2xl font-bold text-gray-800">
                Recent Orders
            </h2>
            <button className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-80 transition-opacity">
                View All Transactions &rarr;
            </button>
         </div>
         
         <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/40 border border-orange-50 overflow-hidden relative">
             {/* Decorative side accent */}
             {/* <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-pink-500"></div> */}
             <div className="pl-1">
                 <OrdersList />
             </div>
         </div>
      </section>

      </div>
    </div>
  );
}

export default DashBoard;