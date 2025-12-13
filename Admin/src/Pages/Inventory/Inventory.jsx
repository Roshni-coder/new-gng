import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";

import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { HiOutlineCube, HiOutlineExclamationCircle, HiOutlineSave, HiOfficeBuilding } from "react-icons/hi";
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { Tabs, Tab, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";

import { toast } from 'react-toastify';

function Inventory() {
    const { backendurl, atoken } = useContext(Admincontext);
    const token = atoken || localStorage.getItem('atoken');

    const [tabValue, setTabValue] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setTabValue(parseInt(tab));
    }, [location.search]);


    // Stock State
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [stats, setStats] = useState({ lowStockCount: 0, totalValue: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editStock, setEditStock] = useState({});

    // Warehouse State
    const [warehouses, setWarehouses] = useState([]);
    const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
    const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '', manager: '', contactNumber: '', capacity: '' });
    const [editingWarehouseId, setEditingWarehouseId] = useState(null);

    // --- 1. Fetch Inventory ---
    const fetchInventory = async () => {
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/inventory`, { headers: { token } });
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

    // --- 2. Fetch Warehouses ---
    const fetchWarehouses = async () => {
        try {
            const { data } = await axios.get(`${backendurl}/api/inventory-hub/warehouse/all`, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) setWarehouses(data.warehouses);
        } catch (error) {
            console.error("Error fetching warehouses", error);
        }
    };

    useEffect(() => {
        if (tabValue === 0) fetchInventory();
        if (tabValue === 1) fetchWarehouses();
    }, [tabValue]);

    // Handle Search
    useEffect(() => {
        const filtered = inventory.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredInventory(filtered);
    }, [searchTerm, inventory]);

    const handleStockUpdate = async (id) => {
        const newStockVal = editStock[id];
        if (!newStockVal) return;

        try {
            await axios.post(`${backendurl}/api/admin/inventory/update`,
                { productId: id, newStock: newStockVal },
                { headers: { token } }
            );
            toast.success("Stock Updated");
            fetchInventory();
            setEditStock(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (error) {
            toast.error("Update failed");
        }
    };

    // --- Warehouse Actions ---
    const handleWarehouseSubmit = async () => {
        try {
            if (editingWarehouseId) {
                await axios.put(`${backendurl}/api/inventory-hub/warehouse/update/${editingWarehouseId}`, warehouseForm, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Warehouse Updated");
            } else {
                await axios.post(`${backendurl}/api/inventory-hub/warehouse/add`, warehouseForm, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Warehouse Added");
            }
            setOpenWarehouseModal(false);
            setWarehouseForm({ name: '', location: '', manager: '', contactNumber: '', capacity: '' });
            setEditingWarehouseId(null);
            fetchWarehouses();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const deleteWarehouse = async (id) => {
        if (!window.confirm("Delete this warehouse?")) return;
        try {
            await axios.delete(`${backendurl}/api/inventory-hub/warehouse/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Warehouse Deleted");
            fetchWarehouses();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    // --- Bulk Update Logic (Simulated by using existing endpoint loop or creating a new bulk one if implemented) ---
    const handleBulkUpdate = async () => {
        // Collect all edits
        const updates = Object.keys(editStock).map(id => ({
            productId: id,
            stock: editStock[id]
        }));

        if (updates.length === 0) {
            toast.info("No changes to save");
            return;
        }

        try {
            // Use the BULK endpoint I created
            await axios.post(`${backendurl}/api/inventory-hub/bulk-update`, { updates }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Updated ${updates.length} products`);
            setEditStock({});
            fetchInventory();
        } catch (error) {
            toast.error("Bulk update failed");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Inventory Hub</h2>
                <p className="text-gray-500">Manage stock, warehouses, and logistics</p>
            </div>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} className="bg-white rounded-t-xl px-4 pt-2">
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Stock Overview" />
                    <Tab label="Warehouse Management" />
                </Tabs>
            </Box>

            {/* --- TAB 1: STOCK OVERVIEW --- */}
            {tabValue === 0 && (
                <>
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

                    <div className="flex justify-between items-center mb-4">
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
                        {Object.keys(editStock).length > 0 && (
                            <Button variant="contained" color="secondary" startIcon={<HiOutlineSave />} onClick={handleBulkUpdate}>
                                Save All ({Object.keys(editStock).length}) Changes
                            </Button>
                        )}
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
                                                        className={`border w-24 px-2 py-1 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-center font-semibold ${editStock[item._id] !== undefined ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                                                        placeholder={item.stock}
                                                        value={editStock[item._id] !== undefined ? editStock[item._id] : ""}
                                                        onChange={(e) => setEditStock({ ...editStock, [item._id]: parseInt(e.target.value) })}
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
                    </div>
                </>
            )}

            {/* --- TAB 2: WAREHOUSE MANAGEMENT --- */}
            {tabValue === 1 && (
                <div>
                    <div className="flex justify-end mb-4">
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => { setEditingWarehouseId(null); setOpenWarehouseModal(true); }}>Add Warehouse</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouses.map(w => (
                            <div key={w._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                        <HiOfficeBuilding size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <IconButton size="small" onClick={() => {
                                            setEditingWarehouseId(w._id);
                                            setWarehouseForm({ name: w.name, location: w.location, manager: w.manager, contactNumber: w.contactNumber, capacity: w.capacity });
                                            setOpenWarehouseModal(true);
                                        }}><FiEdit2 /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => deleteWarehouse(w._id)}><FiTrash2 /></IconButton>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800">{w.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{w.location}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-gray-500">Manager:</span>
                                        <span className="font-medium">{w.manager || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-gray-500">Contact:</span>
                                        <span className="font-medium">{w.contactNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-gray-500">Capacity:</span>
                                        <span className="font-medium">{w.capacity || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {warehouses.length === 0 && <p className="col-span-full text-center py-10 text-gray-400">No warehouses found.</p>}
                    </div>
                </div>
            )}

            {/* Warehouse Modal */}
            <Dialog open={openWarehouseModal} onClose={() => setOpenWarehouseModal(false)}>
                <DialogTitle>{editingWarehouseId ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-4 mt-2 min-w-[300px]">
                        <TextField label="Warehouse Name" size="small" fullWidth value={warehouseForm.name} onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} />
                        <TextField label="Location / Address" size="small" fullWidth value={warehouseForm.location} onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })} />
                        <TextField label="Manager Name" size="small" fullWidth value={warehouseForm.manager} onChange={(e) => setWarehouseForm({ ...warehouseForm, manager: e.target.value })} />
                        <TextField label="Contact Number" size="small" fullWidth value={warehouseForm.contactNumber} onChange={(e) => setWarehouseForm({ ...warehouseForm, contactNumber: e.target.value })} />
                        <TextField label="Capacity" type="number" size="small" fullWidth value={warehouseForm.capacity} onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: e.target.value })} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenWarehouseModal(false)}>Cancel</Button>
                    <Button onClick={handleWarehouseSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Inventory;