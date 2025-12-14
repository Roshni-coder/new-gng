import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaAngleDown, FaAngleUp, FaCalendarAlt, FaSortAmountDown, 
  FaMapMarkerAlt, FaPhoneAlt, FaUser, FaRedoAlt 
} from "react-icons/fa";
import { HiOutlineClipboardList, HiOutlineRefresh, HiOutlineMail } from "react-icons/hi";
import { MdOutlinePayments, MdDoneAll, MdCancel } from "react-icons/md";
import Badges from "../../Components/DashbordBoxes/Badges.jsx";
import axios from "axios";

// Helper for vibrant flat avatar colors
const getAvatarColor = (name) => {
  const colors = [
    "bg-rose-50 text-rose-600 border-rose-200",
    "bg-emerald-50 text-emerald-600 border-emerald-200",
    "bg-sky-50 text-sky-600 border-sky-200",
    "bg-amber-50 text-amber-600 border-amber-200",
    "bg-violet-50 text-violet-600 border-violet-200",
    "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
  ];
  const index = name ? name.length % colors.length : 0;
  return colors[index];
};

function OrdersList() {
  const [isOpenOrderdProduct, setOpenOrderdProduct] = useState(null);
  const [orders, setOrders] = useState([]); 
  const [filteredOrders, setFilteredOrders] = useState([]); 
  
  // States for Filtering & Sorting
  const [activeTab, setActiveTab] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time"); 
  const [sortType, setSortType] = useState("Newest"); 
  const [selectedOrders, setSelectedOrders] = useState([]); 

  const location = useLocation();
  const navigate = useNavigate();

  // 1. Handle URL Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    if (statusParam) setActiveTab(statusParam);
  }, [location.search]);

  // 2. Fetch Data
  const getOrders = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`);
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => { getOrders(); }, []);

  // 3. Filter & Sort Logic
  useEffect(() => {
    let temp = [...orders];

    // Status Filter
    if (activeTab !== "All") {
        temp = temp.filter(order => order.status === activeTab);
    }
    
    // Date Filter
    const now = new Date();
    temp = temp.filter(order => {
        const d = new Date(order.placedAt);
        if (dateFilter === "Today") return d.toDateString() === now.toDateString();
        if (dateFilter === "This Month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (dateFilter === "This Year") return d.getFullYear() === now.getFullYear();
        return true; 
    });

    // Sorting Logic
    if (sortType === "Amount: High-Low") {
        temp.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
    } else if (sortType === "Amount: Low-High") {
        temp.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
    } else if (sortType === "Newest") {
        temp.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    } else if (sortType === "Oldest") {
        temp.sort((a, b) => new Date(a.placedAt) - new Date(b.placedAt));
    }

    setFilteredOrders(temp);
  }, [orders, activeTab, dateFilter, sortType]);

  // --- Reset Filter Function ---
  const resetFilters = () => {
    setActiveTab("All");
    setDateFilter("All Time");
    setSortType("Newest");
    setSelectedOrders([]);
    navigate("/orders", { replace: true });
  };

  const toggleOrderDetails = (index) => setOpenOrderdProduct(isOpenOrderdProduct === index ? null : index);

  const handleSelectAll = (e) => {
    setSelectedOrders(e.target.checked ? filteredOrders.map(o => o._id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  // Modern Flat Tabs Config
  const tabs = [
    { label: "All", value: "All", color: "bg-slate-800 text-white border-slate-800" },
    { label: "Pending", value: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Processing", value: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Shipped", value: "Shipped", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { label: "Delivered", value: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Cancelled", value: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  return (
    <div className="space-y-6 p-8 font-sans text-slate-800">
      
      {/* --- 1. Vibrant Flat Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Orders" 
            count={filteredOrders.length} 
            icon={<HiOutlineClipboardList />} 
            theme="blue"
          />
          <StatCard 
            label="Pending Action" 
            count={filteredOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length} 
            icon={<HiOutlineRefresh />} 
            theme="amber"
          />
          <StatCard 
            label="Completed" 
            count={filteredOrders.filter(o => o.status === 'Delivered').length} 
            icon={<MdDoneAll />} 
            theme="emerald"
          />
          <StatCard 
            label="Cancelled" 
            count={filteredOrders.filter(o => o.status === 'Cancelled').length} 
            icon={<MdCancel />} 
            theme="rose"
          />
      </div>

      {/* --- 2. Main Table Container --- */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Header Filters */}
        <div className="px-6 py-5 border-b border-slate-100 bg-white">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                
                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 xl:pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`
                                px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap border
                                ${activeTab === tab.value 
                                    ? `${tab.color}` 
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Side Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 relative group">
                        <FaSortAmountDown className="text-slate-400 absolute left-3 pointer-events-none" size={12}/>
                        <select 
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 hover:border-slate-300 cursor-pointer appearance-none"
                        >
                            <option value="Newest">Newest First</option>
                            <option value="Oldest">Oldest First</option>
                            <option value="Amount: High-Low">Price: High to Low</option>
                            <option value="Amount: Low-High">Price: Low to High</option>
                        </select>
                    </div>

                    {/* Date Dropdown */}
                    <div className="flex items-center gap-2 relative group">
                        <FaCalendarAlt className="text-slate-400 absolute left-3 pointer-events-none" size={12}/>
                        <select 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 hover:border-slate-300 cursor-pointer appearance-none"
                        >
                            <option value="All Time">All Time</option>
                            <option value="Today">Today</option>
                            <option value="This Month">This Month</option>
                            <option value="This Year">This Year</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <button 
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors"
                        title="Reset all filters"
                    >
                        <FaRedoAlt /> Reset
                    </button>

                </div>
            </div>
        </div>

        {/* --- 3. Table Data --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 w-[40px]">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                </th>
                <th className="px-4 py-4 w-[50px]"></th> 
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const isExpanded = isOpenOrderdProduct === index;
                  const isSelected = selectedOrders.includes(order._id);

                  return (
                    <React.Fragment key={order._id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                         <td className="px-6 py-4">
                            <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(order._id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                        </td>
                        <td className="px-4 py-4">
                          <button 
                            onClick={() => toggleOrderDetails(index)} 
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isExpanded ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                          >
                             {isExpanded ? <FaAngleUp size={12}/> : <FaAngleDown size={12}/>}
                          </button>
                        </td>
                        
                        {/* Order ID */}
                        <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                                #{order._id.slice(-6).toUpperCase()}
                            </span>
                        </td>
                        
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${getAvatarColor(order.shippingAddress?.name)}`}>
                                  {order.shippingAddress?.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-700">{order.shippingAddress?.name}</span>
                                  <span className="text-[11px] text-slate-400">{order.shippingAddress?.phone}</span>
                              </div>
                          </div>
                        </td>

                        {/* Payment Info */}
                        <td className="px-6 py-4">
                           {order.paymentId ? (
                               <div className="flex flex-col items-start">
                                   <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 mb-1">ONLINE</span>
                                   <span className="text-[10px] text-slate-400 font-mono tracking-tight max-w-[80px] truncate" title={order.paymentId}>
                                       {order.paymentId}
                                   </span>
                               </div>
                           ) : (
                               <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">COD</span>
                           )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-800">
                                ₹{order.totalAmount?.toLocaleString('en-IN')}
                            </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                             <div className="transform scale-95 origin-left">
                                <Badges status={order.status} />
                             </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col text-sm text-slate-500 font-medium">
                                <span>{new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                                <span className="text-[10px] text-slate-400">{new Date(order.placedAt).getFullYear()}</span>
                            </div>
                        </td>
                      </tr>

                      {/* --- Expanded Details View (Clean & No Over-Shadow) --- */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="8" className="p-0">
                            <div className="p-4 bg-slate-50/50 border-y border-slate-100">
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col lg:flex-row">
                                  
                                  {/* Left: Product List */}
                                  <div className="flex-1 border-r border-slate-100">
                                      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordered Items</h4>
                                          <span className="text-xs font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                                              {order.items?.length} Items
                                          </span>
                                      </div>
                                      <div className="divide-y divide-slate-50">
                                          {order.items?.map((item) => (
                                              <div key={item._id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                                                  <div className="flex items-center gap-4">
                                                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                                          {item.image || order.image ? 
                                                            <img src={item.image || order.image} className="w-full h-full object-cover"/> 
                                                            : <div className="flex items-center justify-center h-full text-[10px] text-slate-400">IMG</div>
                                                          }
                                                      </div>
                                                      <div>
                                                          <p className="text-sm font-semibold text-slate-700">{item.productId?.title || "Product Removed"}</p>
                                                          <div className="flex items-center gap-2 mt-1">
                                                              <span className="text-xs text-slate-500 bg-slate-100 px-1.5 rounded border border-slate-200">Qty: {item.quantity}</span>
                                                              <span className="text-xs text-slate-400">x</span>
                                                              <span className="text-xs text-slate-500">₹{item.price}</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div className="text-right">
                                                      <p className="text-sm font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Right: Customer & Shipping (Pincode Included) */}
                                  <div className="w-full lg:w-[320px] bg-slate-50/30 p-5 flex flex-col gap-6">
                                      
                                      {/* Address Details */}
                                      <div>
                                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                              <FaMapMarkerAlt className="text-indigo-500"/> Shipping Details
                                          </h4>
                                          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                              <p className="font-bold text-sm text-slate-700 mb-1">{order.shippingAddress?.name}</p>
                                              <p className="text-xs text-slate-500 leading-relaxed">
                                                  {order.shippingAddress?.address} <br/>
                                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} <br/>
                                              </p>
                                              
                                              {/* ✅ PINCODE FIX: Checks for multiple common field names */}
                                              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                                                      {order.shippingAddress?.country || "India"}
                                                  </span>
                                                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                      PIN: {order.shippingAddress?.pincode || order.shippingAddress?.zipCode || order.shippingAddress?.pinCode || order.shippingAddress?.postalCode || "N/A"}
                                                  </span>
                                              </div>
                                          </div>
                                      </div>

                                      {/* Contact Info */}
                                      <div>
                                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                              <FaUser className="text-indigo-500"/> Contact Info
                                          </h4>
                                          <div className="space-y-2">
                                              <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-lg border border-slate-100">
                                                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                                                      <FaPhoneAlt />
                                                  </div>
                                                  <span className="text-xs font-medium text-slate-600">{order.shippingAddress?.phone || "N/A"}</span>
                                              </div>
                                              {order.shippingAddress?.email && (
                                                  <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-lg border border-slate-100">
                                                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[12px]">
                                                          <HiOutlineMail />
                                                      </div>
                                                      <span className="text-xs font-medium text-slate-600 truncate w-[180px]" title={order.shippingAddress.email}>
                                                          {order.shippingAddress.email}
                                                      </span>
                                                  </div>
                                              )}
                                          </div>
                                      </div>

                                  </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                            <HiOutlineClipboardList className="text-xl text-slate-300"/>
                        </div>
                        <p>No orders found matching your filters.</p>
                        <button onClick={resetFilters} className="text-xs text-blue-600 font-bold hover:underline mt-1">Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Clean Flat Stat Card Component
const StatCard = ({ label, count, icon, theme }) => {
    const themes = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        rose: "bg-rose-50 text-rose-700 border-rose-100",
    };

    const iconThemes = {
        blue: "bg-blue-100 text-blue-600",
        amber: "bg-amber-100 text-amber-600",
        emerald: "bg-emerald-100 text-emerald-600",
        rose: "bg-rose-100 text-rose-600",
    };

    return (
        <div className={`rounded-xl p-5 border ${themes[theme]} flex items-center justify-between hover:scale-[1.02] transition-transform shadow-sm`}>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
                <h3 className="text-2xl font-extrabold">{count}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconThemes[theme]}`}>
                {icon}
            </div>
        </div>
    );
};

export default OrdersList;