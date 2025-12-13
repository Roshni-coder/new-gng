import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Tab, Tabs, Box, Button, TextField, IconButton, Card, CardContent } from '@mui/material';
import { MdAdd, MdDelete, MdEdit, MdCardGiftcard, MdOutlineMail, MdInventory2, MdOutlineMessage, MdBusinessCenter, MdLocalShipping } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Admincontext } from '../../Components/context/admincontext';

const GiftOptions = () => {
    const { backendurl, atoken } = useContext(Admincontext);
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal/Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: null // File object
    });
    const [editingId, setEditingId] = useState(null);

    // Updated Types Mapping
    const types = ['wrapper', 'card', 'message', 'packaging', 'corporate', 'bulk'];
    const currentType = types[tabValue];

    // Initialize tab from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setTabValue(parseInt(tab));
    }, [location.search]);

    useEffect(() => {
        fetchItems();
    }, [tabValue]);

    const getAuthToken = () => {
        return atoken || localStorage.getItem('atoken');
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                // return;
            }

            const { data } = await axios.get(`${backendurl}/api/gift-options/all?type=${currentType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setItems(data.options);
            }
        } catch (error) {
            console.error("Error fetching gift options:", error);
            // toast.error("Failed to load options");
        } finally {
            setLoading(false);
        }
    };

    const handeSubmit = async (e) => {
        e.preventDefault();
        const token = getAuthToken();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description || '');
        data.append('type', currentType);
        if (formData.image) {
            data.append('images', formData.image);
        }

        try {
            if (editingId) {
                await axios.put(`${backendurl}/api/gift-options/update/${editingId}`, data, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Updated successfully!");
            } else {
                await axios.post(`${backendurl}/api/gift-options/add`, data, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Added successfully!");
            }
            setShowForm(false);
            setFormData({ name: '', price: '', description: '', image: null });
            setEditingId(null);
            fetchItems();
        } catch (error) {
            console.error("Error saving option:", error);
            toast.error("Failed to save option");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        const token = getAuthToken();
        try {
            await axios.delete(`${backendurl}/api/gift-options/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Deleted!");
            fetchItems();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const openEdit = (item) => {
        setFormData({
            name: item.name,
            price: item.price,
            description: item.description,
            image: null
        });
        setEditingId(item._id);
        setShowForm(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gift Options Management</h1>
                    <p className="text-gray-500">Manage wrappers, cards, packaging, and corporate gifting</p>
                </div>
                <Button
                    variant="contained"
                    startIcon={<MdAdd />}
                    onClick={() => { setEditingId(null); setShowForm(!showForm); }}
                    className="!bg-purple-600 !hover:bg-purple-700"
                >
                    {showForm ? 'Close Form' : 'Add New Option'}
                </Button>
            </div>

            {/* TABS */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} className="bg-white rounded-t-xl px-4 pt-2">
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
                    <Tab icon={<MdCardGiftcard size={20} />} iconPosition="start" label="Gift Wrapping" />
                    <Tab icon={<MdOutlineMail size={20} />} iconPosition="start" label="Greeting Cards" />
                    <Tab icon={<MdOutlineMessage size={20} />} iconPosition="start" label="Gift Messages" />
                    <Tab icon={<MdInventory2 size={20} />} iconPosition="start" label="Special Packaging" />
                    <Tab icon={<MdBusinessCenter size={20} />} iconPosition="start" label="Corporate Gifting" />
                    <Tab icon={<MdLocalShipping size={20} />} iconPosition="start" label="Bulk Gift Orders" />
                </Tabs>
            </Box>

            {/* FORM AREA */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-purple-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4 text-purple-700">{editingId ? 'Edit Option' : `Add New ${currentType.charAt(0).toUpperCase() + currentType.slice(1)}`}</h3>
                    <form onSubmit={handeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                            label="Option Name"
                            fullWidth
                            size="small"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <TextField
                            label="Price (₹)"
                            type="number"
                            fullWidth
                            size="small"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <div className="md:col-span-2">
                            <TextField
                                label="Description (Optional)"
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <p className="mb-1 text-sm text-gray-600">Upload Image</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700
                        hover:file:bg-purple-100
                        "
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                            <Button variant="outlined" color="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" variant="contained" className="!bg-purple-600">Save Option</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* GRID LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div key={item._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden relative">
                        <div className="h-48 overflow-hidden bg-gray-100 relative">
                            {item.images && item.images.length > 0 ? (
                                <img src={`${backendurl}/${item.images[0].url}`.replace('//', '/').replace(':/', '://')} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300"><MdCardGiftcard size={40} /></div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(item)} className="p-2 bg-white/90 rounded-full text-blue-600 hover:bg-blue-50 shadow-sm"><MdEdit /></button>
                                <button onClick={() => handleDelete(item._id)} className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-red-50 shadow-sm"><MdDelete /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                                <span className="font-bold text-green-600">₹{item.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{item.description || 'No description'}</p>

                            {/* Visual styling for type */}
                            <span className="inline-block mt-3 px-2 py-1 bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider rounded">
                                {item.type}
                            </span>
                        </div>
                    </div>
                ))}

                {items.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                        <MdCardGiftcard size={60} className="mb-4 opacity-50" />
                        <p>No options found for this category. Add one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GiftOptions;

