import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { HiOutlineCube, HiOutlineExclamationCircle, HiOutlineSave } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";

function Inventory() {
  const { backendurl, atoken } = useContext(Admincontext);
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [stats, setStats] = useState({ lowStockCount: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editStock, setEditStock] = useState({}); // Track edits locally before saving

  const fetchInventory = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/admin/inventory`, { headers: { token: atoken } });
      if (data.success) {
        setInventory(data.inventory);
        setFilteredInventory(data.inventory);
        setStats({
            lowStockCount: data.lowStockCount,
            totalValue: data.totalValue
        });
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Search
  useEffect(() => {
    const filtered = inventory.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const handleStockUpdate = async (id) => {
    const newStockVal = editStock[id];
    if(!newStockVal) return;

    try {
      await axios.post(`${backendurl}/api/admin/inventory/update`, 
        { productId: id, newStock: newStockVal }, 
        { headers: { token: atoken } }
      );
      // alert("Stock Updated"); // Optional: Toast notification is better
      fetchInventory(); 
      setEditStock(prev => {
          const newState = { ...prev };
          delete newState[id]; // Clear edit state after save
          return newState;
      });
    } catch (error) {
      alert("Update failed");
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
            <p className="text-gray-500 text-sm">Track stock levels and update quantities</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-gray-500 font-medium text-sm">Total Inventory Value</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-2">₹{stats.totalValue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <HiOutlineCube size={24} />
            </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border flex items-start justify-between ${stats.lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
            <div>
                <p className={`font-medium text-sm ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-500'}`}>Low Stock Alerts</p>
                <h3 className={`text-2xl font-bold mt-2 ${stats.lowStockCount > 0 ? 'text-red-700' : 'text-gray-800'}`}>{stats.lowStockCount}</h3>
                <p className="text-xs mt-1 opacity-80">Items below threshold (10)</p>
            </div>
            <div className={`p-3 rounded-xl ${stats.lowStockCount > 0 ? 'bg-white text-red-600' : 'bg-gray-50 text-gray-600'}`}>
                <HiOutlineExclamationCircle size={24} />
            </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4">Stock Level</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                    ) : filteredInventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {item.title}
                            </td>
                            <td className="px-6 py-4">₹{item.price}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {item.stock < 10 ? 'Low Stock' : 'In Stock'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="border border-gray-300 w-20 px-2 py-1 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-center font-semibold"
                                        placeholder={item.stock}
                                        value={editStock[item._id] !== undefined ? editStock[item._id] : ""}
                                        onChange={(e) => setEditStock({...editStock, [item._id]: e.target.value})}
                                    />
                                    <span className="text-gray-400 text-xs">/ units</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {editStock[item._id] !== undefined && (
                                    <button 
                                        onClick={() => handleStockUpdate(item._id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                                    >
                                        <HiOutlineSave size={14} /> Update
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredInventory.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400">
                No products found matching "{searchTerm}"
            </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;