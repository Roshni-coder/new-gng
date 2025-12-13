import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, Chip, LinearProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Avatar } from "@mui/material";
import { MdCardGiftcard, MdDelete, MdEdit, MdCelebration, MdCake, MdFavorite } from "react-icons/md";
import { FiRefreshCw, FiPlus, FiGift } from "react-icons/fi";

function GreetingCards() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [cards, setCards] = useState([]);
    const [editCard, setEditCard] = useState(null);
    const [form, setForm] = useState({
        title: "", category: "birthday", image: "", template: "", isActive: true, isPremium: false, price: 0
    });

    const categories = [
        { value: 'birthday', label: 'Birthday', icon: <MdCake />, color: 'bg-pink-500' },
        { value: 'anniversary', label: 'Anniversary', icon: <MdFavorite />, color: 'bg-red-500' },
        { value: 'wedding', label: 'Wedding', icon: <MdFavorite />, color: 'bg-purple-500' },
        { value: 'festive', label: 'Festive', icon: <MdCelebration />, color: 'bg-yellow-500' },
        { value: 'thank_you', label: 'Thank You', icon: <MdCardGiftcard />, color: 'bg-green-500' },
        { value: 'congratulations', label: 'Congratulations', icon: <MdCelebration />, color: 'bg-blue-500' },
        { value: 'sympathy', label: 'Sympathy', icon: <MdFavorite />, color: 'bg-gray-500' },
        { value: 'other', label: 'Other', icon: <MdCardGiftcard />, color: 'bg-indigo-500' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/greeting-cards`, { headers: { token: atoken } });
            if (data.success) setCards(data.cards || []);
        } catch (e) {
            console.error("Error fetching greeting cards:", e);
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditCard(null);
        setForm({ title: "", category: "birthday", image: "", template: "", isActive: true, isPremium: false, price: 0 });
        setOpenDialog(true);
    };

    const openEditDialog = (card) => {
        setEditCard(card);
        setForm({
            title: card.title,
            category: card.category,
            image: card.image || "",
            template: card.template || "",
            isActive: card.isActive,
            isPremium: card.isPremium,
            price: card.price || 0
        });
        setOpenDialog(true);
    };

    const saveCard = async () => {
        if (!form.title) return;
        try {
            if (editCard) {
                await axios.put(`${backendurl}/api/admin/settings/greeting-card/${editCard._id}`, form, { headers: { token: atoken } });
                setSuccess("Greeting card updated!");
            } else {
                await axios.post(`${backendurl}/api/admin/settings/greeting-card`, form, { headers: { token: atoken } });
                setSuccess("Greeting card created!");
            }
            fetchData();
            setOpenDialog(false);
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to save greeting card");
        }
    };

    const deleteCard = async (id) => {
        if (!window.confirm("Are you sure you want to delete this greeting card?")) return;
        try {
            await axios.delete(`${backendurl}/api/admin/settings/greeting-card/${id}`, { headers: { token: atoken } });
            fetchData();
            setSuccess("Greeting card deleted!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to delete greeting card");
        }
    };

    const getCategoryInfo = (cat) => {
        return categories.find(c => c.value === cat) || categories[7];
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-50 text-pink-600 rounded-lg"><MdCardGiftcard size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Greeting Cards</h2>
                        <p className="text-sm text-gray-500">Manage greeting card templates for gift orders.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<FiPlus />} onClick={openCreateDialog}>Add Card</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap mb-6">
                <Chip label="All" onClick={() => { }} variant="filled" color="primary" />
                {categories.map(cat => (
                    <Chip key={cat.value} label={cat.label} onClick={() => { }} variant="outlined" />
                ))}
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cards.map(card => {
                    const catInfo = getCategoryInfo(card.category);
                    return (
                        <Card key={card._id} className={`hover:shadow-lg transition-all ${!card.isActive ? 'opacity-60' : ''}`}>
                            <CardContent className="text-center">
                                <div className={`w-16 h-16 ${catInfo.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-white`}>
                                    {card.image ? (
                                        <img src={card.image} alt={card.title} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <MdCardGiftcard size={32} />
                                    )}
                                </div>
                                <h4 className="font-bold text-sm mb-1 line-clamp-1">{card.title}</h4>
                                <div className="flex justify-center gap-1 mb-2">
                                    <Chip size="small" label={catInfo.label} sx={{ fontSize: 10, height: 20 }} />
                                    {card.isPremium && <Chip size="small" label="Premium" color="warning" sx={{ fontSize: 10, height: 20 }} />}
                                </div>
                                {card.isPremium && <p className="text-sm font-bold text-green-600">₹{card.price}</p>}
                                <p className="text-xs text-gray-400 mt-1">Used: {card.usageCount || 0} times</p>
                                <div className="flex justify-center gap-1 mt-3">
                                    <IconButton size="small" color="primary" onClick={() => openEditDialog(card)}><MdEdit /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => deleteCard(card._id)}><MdDelete /></IconButton>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Add New Card */}
                <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-gray-300" onClick={openCreateDialog}>
                    <CardContent className="text-center h-full flex flex-col items-center justify-center min-h-[200px]">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <FiPlus size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Add New Card</p>
                    </CardContent>
                </Card>
            </div>

            {cards.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <FiGift size={48} className="mx-auto text-gray-300 mb-3" />
                    <p>No greeting cards created yet</p>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editCard ? 'Edit Greeting Card' : 'Add Greeting Card'}</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <TextField fullWidth label="Card Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {categories.map(cat => (
                                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="Image URL (optional)" placeholder="https://example.com/card.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                        <TextField fullWidth label="Template Text" multiline rows={4} placeholder="Wishing you a wonderful {{occasion}}! Best wishes, {{sender_name}}" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} helperText="Use {{occasion}}, {{recipient_name}}, {{sender_name}}, {{message}} as variables" />
                        <div className="flex gap-4">
                            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />
                            <FormControlLabel control={<Switch checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} color="warning" />} label="Premium" />
                        </div>
                        {form.isPremium && (
                            <TextField label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} />
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveCard}>{editCard ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default GreetingCards;
