import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, Chip, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from "@mui/material";
import { MdMessage, MdDelete, MdEdit, MdEmail, MdSms, MdNotifications } from "react-icons/md";
import { FiRefreshCw, FiPlus } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";

function MessageTemplates() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [editTemplate, setEditTemplate] = useState(null);
    const [form, setForm] = useState({
        name: "", type: "email", trigger: "", subject: "", body: "", isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/message-templates`, { headers: { token: atoken } });
            if (data.success) setTemplates(data.templates || []);
        } catch (e) {
            console.error("Error fetching templates:", e);
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditTemplate(null);
        setForm({ name: "", type: "email", trigger: "", subject: "", body: "", isActive: true });
        setOpenDialog(true);
    };

    const openEditDialog = (template) => {
        setEditTemplate(template);
        setForm({
            name: template.name,
            type: template.type,
            trigger: template.trigger || "",
            subject: template.subject || "",
            body: template.body,
            isActive: template.isActive
        });
        setOpenDialog(true);
    };

    const saveTemplate = async () => {
        if (!form.name || !form.body) return;
        try {
            if (editTemplate) {
                await axios.put(`${backendurl}/api/admin/settings/message-template/${editTemplate._id}`, form, { headers: { token: atoken } });
                setSuccess("Template updated!");
            } else {
                await axios.post(`${backendurl}/api/admin/settings/message-template`, form, { headers: { token: atoken } });
                setSuccess("Template created!");
            }
            fetchData();
            setOpenDialog(false);
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to save template");
        }
    };

    const deleteTemplate = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await axios.delete(`${backendurl}/api/admin/settings/message-template/${id}`, { headers: { token: atoken } });
            fetchData();
            setSuccess("Template deleted!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to delete template");
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'email': return <MdEmail className="text-blue-500" />;
            case 'sms': return <MdSms className="text-green-500" />;
            case 'push': return <MdNotifications className="text-orange-500" />;
            default: return <MdMessage className="text-gray-500" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'email': return 'primary';
            case 'sms': return 'success';
            case 'push': return 'warning';
            case 'whatsapp': return 'success';
            default: return 'default';
        }
    };

    const triggers = [
        'order_placed', 'order_confirmed', 'order_shipped', 'order_delivered',
        'order_cancelled', 'payment_received', 'payment_failed',
        'user_registered', 'password_reset', 'otp_verification',
        'wishlist_reminder', 'cart_abandoned', 'birthday_offer'
    ];

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><HiOutlineTemplate size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Message Templates</h2>
                        <p className="text-sm text-gray-500">Manage email, SMS, and push notification templates.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<FiPlus />} onClick={openCreateDialog}>Create Template</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Templates Table */}
            <TableContainer component={Paper} className="rounded-xl">
                <Table>
                    <TableHead className="bg-gray-50">
                        <TableRow>
                            <TableCell><strong>Template Name</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Trigger</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {templates.map(template => (
                            <TableRow key={template._id} hover>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(template.type)}
                                        <div>
                                            <p className="font-medium">{template.name}</p>
                                            {template.subject && <p className="text-xs text-gray-500">Subject: {template.subject}</p>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Chip size="small" label={template.type} color={getTypeColor(template.type)} /></TableCell>
                                <TableCell><span className="text-sm capitalize">{template.trigger?.replace(/_/g, ' ') || '-'}</span></TableCell>
                                <TableCell><Chip size="small" label={template.isActive ? "Active" : "Inactive"} color={template.isActive ? "success" : "default"} variant="outlined" /></TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary" onClick={() => openEditDialog(template)}><MdEdit /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => deleteTemplate(template._id)}><MdDelete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {templates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <HiOutlineTemplate size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No templates created yet</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <TextField fullWidth label="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    <MenuItem value="email">Email</MenuItem>
                                    <MenuItem value="sms">SMS</MenuItem>
                                    <MenuItem value="push">Push Notification</MenuItem>
                                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <FormControl fullWidth>
                            <InputLabel>Trigger Event</InputLabel>
                            <Select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
                                <MenuItem value="">None (Manual)</MenuItem>
                                {triggers.map(t => (
                                    <MenuItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {form.type === 'email' && (
                            <TextField fullWidth label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                        )}
                        <TextField fullWidth label="Message Body" multiline rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} helperText="Use variables like {{name}}, {{orderId}}, {{trackingUrl}}" />
                        <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveTemplate}>{editTemplate ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MessageTemplates;
