import React, { useEffect, useState, useMemo } from "react";
import { FaAngleDown, FaAngleUp, FaPhoneAlt, FaEnvelope, FaEdit, FaCheck } from "react-icons/fa";
import { LuStore, LuPackageOpen, LuSearch, LuClipboardList, LuWallet } from "react-icons/lu"; 
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";
import axios from "axios";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import SearchBox from "../../Components/SearchBox/SearchBox.jsx";
import { toast } from "react-toastify"; 

// ... (Keep getAvatarColor helper same as before) ...
const getAvatarColor = (name) => {
  const colors = [
    "bg-blue-100 text-blue-700", "bg-indigo-100 text-indigo-700",
    "bg-cyan-100 text-cyan-700", "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700", "bg-teal-100 text-teal-700",
  ];
  return colors[name ? name.length % colors.length : 0];
};

function SellersList() {
  // Main Data State
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // UI States
  const [openSellerIndex, setOpenSellerIndex] = useState(null);
  const [sellerProducts, setSellerProducts] = useState({});
  const [activeTab, setActiveTab] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");

  // Commission Edit State
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [tempCommission, setTempCommission] = useState(0);

  // 1. Fetch Sellers (Dynamic Search)
  const fetchSellers = async (query = "") => {
    try {
      setLoading(true);
      // Pass the search query as a parameter
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/sellers`,
        { params: { search: query } } 
      );
      if (data.success) {
        setSellers(data.sellers);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Seller Products
  const fetchSellerProducts = async (sellerId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/seller-products/${sellerId}`
      );
      if (data.success) {
        setSellerProducts((prev) => ({
          ...prev,
          [sellerId]: data.products,
        }));
      }
    } catch (error) {
      console.error("Error fetching seller products:", error);
    }
  };

  const toggleSellerRow = (index, sellerId) => {
    const newIndex = openSellerIndex === index ? null : index;
    setOpenSellerIndex(newIndex);
    if (newIndex !== null && !sellerProducts[sellerId]) {
      fetchSellerProducts(sellerId);
    }
  };

  // --- ACTIONS (Approve, Commission, etc) --- 
  
  const handleToggleApproveSeller = async (sellerId) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/toggle-approve/${sellerId}`
      );
      if (data.success) {
        setSellers((prev) =>
          prev.map((s) => (s._id === sellerId ? { ...s, approved: data.seller.approved } : s))
        );
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateCommission = async (sellerId) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/seller-commission/${sellerId}`,
        { commissionRate: tempCommission }
      );
      if (data.success) {
        setSellers((prev) => 
          prev.map((s) => (s._id === sellerId ? { ...s, commissionRate: tempCommission } : s))
        );
        setEditingCommissionId(null);
        toast.success("Commission updated");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleApproveProduct = async (productId, sellerId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/toggle-product/${productId}`
      );
      if (res.data.success) {
        setSellerProducts((prev) => ({
          ...prev,
          [sellerId]: prev[sellerId].map((product) => 
            product._id === productId ? { ...product, approved: !product.approved } : product
          )
        }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // --- DYNAMIC SEARCH LOGIC (Server-Side) ---

  const handleSearch = (e) => {
    const value = e.target ? e.target.value : e;
    setSearchTerm(value);
  };

  // Debounce Effect: Calls API 500ms after user stops typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSellers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- CLIENT-SIDE TAB FILTERING ---
  // We filter the API results based on the active tab (Active vs Pending)
  const filteredSellers = useMemo(() => {
    if (activeTab === 'active') return sellers.filter(s => s.approved);
    if (activeTab === 'pending') return sellers.filter(s => !s.approved);
    return sellers;
  }, [sellers, activeTab]);


  return (
    <div className="bg-white rounded-xl shadow-2xl shadow-blue-50 border border-blue-50 overflow-hidden my-6">
      
      {/* --- Header Section --- */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-700 px-8 py-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <LuStore className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Partner Sellers</h2>
              <p className="text-sm text-blue-100 opacity-80">Manage vendors, approvals, and commissions.</p>
            </div>
          </div>
          
          {/* SEARCH BOX */}
          <div className="w-full md:w-1/3">
             <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <SearchBox
                    value={searchTerm}
                    onChange={handleSearch} 
                    placeholder="Search name, email, phone..."
                />
             </div>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="flex items-center gap-4 mt-8">
            {['all', 'active', 'pending'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all
                        ${activeTab === tab 
                            ? 'bg-white text-blue-700 shadow-lg scale-105' 
                            : 'bg-white/10 text-blue-100 hover:bg-white/20'}
                    `}
                >
                    {tab === 'active' ? 'Active Vendors' : tab === 'pending' ? 'Pending Approvals' : 'All Vendors'}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <CircularProgress style={{ color: '#2563eb' }} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left border-collapse">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-[50px]">View</th>
                <th className="px-6 py-4">Seller Details</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Commission (%)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSellers.map((seller, index) => {
                  const isExpanded = openSellerIndex === index;
                  const avatarClass = getAvatarColor(seller.name);

                  return (
                    <React.Fragment key={seller._id}>
                      <tr className={`transition-all duration-200 ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                        {/* Expand Toggle */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleSellerRow(index, seller._id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all border ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}
                          >
                            {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                          </button>
                        </td>

                        {/* Seller Identity */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                {seller.image ? (
                                    <img src={seller.image} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"/>
                                ) : (
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${avatarClass}`}>
                                        {seller.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-slate-800">{seller.name}</span>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FaEnvelope className="text-slate-400"/> {seller.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FaPhoneAlt className="text-slate-400"/> {seller.phone || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </td>

                        {/* Performance Stats */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md w-fit">
                                    <LuClipboardList className="text-blue-500"/> {seller.totalOrders || 0} Orders
                                </span>
                                <span className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md w-fit">
                                    <LuWallet className="text-emerald-500"/> ₹{(seller.totalSales || 0).toLocaleString()} Revenue
                                </span>
                            </div>
                        </td>

                        {/* Commission */}
                        <td className="px-6 py-4">
                            {editingCommissionId === seller._id ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={tempCommission}
                                        onChange={(e) => setTempCommission(e.target.value)}
                                        className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <button onClick={() => handleUpdateCommission(seller._id)} className="p-1 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100">
                                        <FaCheck size={14}/>
                                    </button>
                                    <button onClick={() => setEditingCommissionId(null)} className="p-1 text-rose-600 bg-rose-50 rounded hover:bg-rose-100">
                                        <HiOutlineX size={14}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                                    setTempCommission(seller.commissionRate || 0);
                                    setEditingCommissionId(seller._id);
                                }}>
                                    <span className="font-bold text-slate-700">{seller.commissionRate || 0}%</span>
                                    <FaEdit className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" size={12}/>
                                </div>
                            )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${seller.approved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${seller.approved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {seller.approved ? "Active" : "Pending"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-center">
                          <Button
                            size="small"
                            variant="contained"
                            disableElevation
                            style={{
                                backgroundColor: seller.approved ? "#fee2e2" : "#dbeafe",
                                color: seller.approved ? "#dc2626" : "#2563eb",
                                fontWeight: "bold",
                                textTransform: "none",
                                borderRadius: "8px",
                            }}
                            onClick={() => handleToggleApproveSeller(seller._id)}
                          >
                            {seller.approved ? "Suspend" : "Approve"}
                          </Button>
                        </td>
                      </tr>

                      {/* --- Expanded Products View --- */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="p-0">
                            <div className="bg-slate-50/80 p-6 shadow-inner border-y border-slate-100">
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto">
                                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-md text-blue-600"><LuPackageOpen size={18}/></div>
                                        <h3 className="text-xs font-bold text-slate-800 uppercase">Seller Inventory</h3>
                                    </div>
                                    <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-medium">
                                        {sellerProducts[seller._id]?.length || 0} Items
                                    </span>
                                </div>

                                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                  <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold sticky top-0">
                                      <tr>
                                        <th className="px-6 py-3">Image</th>
                                        <th className="px-6 py-3">Product Name</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-center">Moderation</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                      {sellerProducts[seller._id]?.length > 0 ? (
                                        sellerProducts[seller._id].map((product) => (
                                          <tr key={product._id} className="hover:bg-blue-50/30">
                                            <td className="px-6 py-3">
                                                <img src={product.images[0]?.url} alt="" className="w-10 h-10 object-contain rounded border border-slate-200"/>
                                            </td>
                                            <td className="px-6 py-3">
                                                <p className="font-medium text-slate-700 truncate max-w-[200px]">{product.title}</p>
                                            </td>
                                            <td className="px-6 py-3 font-bold text-slate-600">₹{product.price}</td>
                                            <td className="px-6 py-3">
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${product.approved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                    {product.approved ? 'Live' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <Tooltip title={product.approved ? "Disapprove" : "Approve"}>
                                                  <button onClick={() => toggleApproveProduct(product._id, seller._id)} className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${product.approved ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-500 hover:bg-green-50'}`}>
                                                    {product.approved ? <HiOutlineX size={14}/> : <HiOutlineCheck size={14}/>}
                                                  </button>
                                                </Tooltip>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr><td colSpan="5" className="text-center py-6 text-slate-400 italic">No products listed.</td></tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
          {!filteredSellers.length && !loading && (
             <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <LuSearch className="text-4xl text-slate-200 mb-3"/>
                <p>No sellers found matching "{searchTerm}"</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SellersList;