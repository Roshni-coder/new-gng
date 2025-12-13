import React, { useEffect, useState, useContext } from "react";
import { Admincontext } from "../../Components/context/admincontext";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { FiDownload, FiTrendingUp, FiUsers, FiActivity, FiPieChart } from "react-icons/fi";
import { toast } from "react-toastify";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-lg">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        <p className="text-indigo-600 font-semibold text-sm">
          Revenue: ₹{payload[0].value.toLocaleString()}
        </p>
        <p className="text-gray-500 text-xs">
          Orders: {payload[0].payload.Orders}
        </p>
      </div>
    );
  }
  return null;
};

function Analytics() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [chartData, setChartData] = useState([]);
    const [summary, setSummary] = useState({ totalRev: 0, totalOrders: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`${backendurl}/api/admin/analytics/advanced`, { headers: { token: atoken } });
                if(data.success) {
                    const formatted = data.revenueData.map(item => ({
                        name: `Month ${item._id}`,
                        Revenue: item.totalRevenue,
                        Orders: item.count
                    }));
                    setChartData(formatted);
                    
                    const totalRev = formatted.reduce((acc, curr) => acc + curr.Revenue, 0);
                    const totalOrders = formatted.reduce((acc, curr) => acc + curr.Orders, 0);
                    setSummary({ totalRev, totalOrders });
                }
            } catch (error) {
                console.error("Analytics Error", error);
            }
        };
        fetchData();
    }, [backendurl, atoken]);

    // Handle Excel Download
    const handleDownload = async () => {
        try {
            const response = await axios.get(`${backendurl}/api/admin/analytics/export`, {
                headers: { token: atoken },
                responseType: 'blob', // Important for files
            });
            
            // Create a link to download the file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Sales_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Report Downloaded Successfully");
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download report");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Business Analytics</h2>
                    <p className="text-gray-500 text-sm">Deep dive into your store's performance</p>
                </div>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    <FiDownload /> Export Excel Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <FiTrendingUp size={80} className="text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{summary.totalRev.toLocaleString()}</h3>
                        <span className="inline-block mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+12.5% from last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <FiActivity size={80} className="text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{summary.totalOrders}</h3>
                        <span className="inline-block mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+5.2% new orders</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <FiUsers size={80} className="text-orange-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-500 text-sm font-medium">Avg. Order Value</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">
                            ₹{summary.totalOrders > 0 ? (summary.totalRev / summary.totalOrders).toFixed(0) : 0}
                        </h3>
                        <span className="inline-block mt-2 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded">Based on current sales</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Area Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FiTrendingUp className="text-indigo-500"/> Revenue Growth
                        </h3>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="Revenue" 
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Traffic Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiPieChart className="text-orange-500"/> Traffic Sources
                    </h3>
                    <div className="flex-1 space-y-6">
                        {[
                            { name: 'Direct Traffic', val: 45, color: 'bg-indigo-500' },
                            { name: 'Social Media', val: 30, color: 'bg-pink-500' },
                            { name: 'Organic Search', val: 15, color: 'bg-emerald-500' },
                            { name: 'Referral', val: 10, color: 'bg-orange-500' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">{item.name}</span>
                                    <span className="font-bold text-gray-800">{item.val}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${item.color}`} 
                                        style={{ width: `${item.val}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            <span className="font-bold text-gray-700">Tip:</span> Connect Google Analytics API to get real-time live visitor data in this section.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;