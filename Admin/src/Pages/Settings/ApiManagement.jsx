import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, Tooltip } from "@mui/material";
import { MdDelete, MdContentCopy, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { MdApi } from "react-icons/md";
import { FiRefreshCw, FiPlus, FiKey } from "react-icons/fi";

function ApiManagement() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [showSecrets, setShowSecrets] = useState({});
    const [newApiKey, setNewApiKey] = useState({ apiName: "", rateLimit: 1000, allowedOrigins: "" });
    const [apiKeys, setApiKeys] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/api-keys`, { headers: { token: atoken } });
            if (data.success) setApiKeys(data.keys || []);
        } catch (e) {
            console.error("Error fetching API keys:", e);
        } finally {
            setLoading(false);
        }
    };

    const createKey = async () => {
        if (!newApiKey.apiName) return;
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/api-key`, {
                ...newApiKey,
                allowedOrigins: newApiKey.allowedOrigins.split(',').map(s => s.trim()).filter(Boolean)
            }, { headers: { token: atoken } });
            if (data.success) {
                fetchData();
                setOpenDialog(false);
                setNewApiKey({ apiName: "", rateLimit: 1000, allowedOrigins: "" });
                setSuccess("API key created successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to create API key");
        }
    };

    const deleteKey = async (id) => {
        if (!window.confirm("Are you sure you want to delete this API key?")) return;
        try {
            await axios.delete(`${backendurl}/api/admin/settings/api-key/${id}`, { headers: { token: atoken } });
            fetchData();
            setSuccess("API key deleted!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to delete API key");
        }
    };

    const toggleKey = async (id, isActive) => {
        try {
            await axios.put(`${backendurl}/api/admin/settings/api-key/${id}/toggle`, { isActive }, { headers: { token: atoken } });
            fetchData();
        } catch (e) {
            alert("Failed to update API key");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess("Copied to clipboard!");
        setTimeout(() => setSuccess(""), 2000);
    };

    const toggleShowSecret = (id) => {
        setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><MdApi size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">API Management</h2>
                        <p className="text-sm text-gray-500">Manage API keys for external integrations.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpenDialog(true)}>Generate API Key</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* API Keys Table */}
            <TableContainer component={Paper} className="rounded-xl">
                <Table>
                    <TableHead className="bg-gray-50">
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>API Key</strong></TableCell>
                            <TableCell><strong>Rate Limit</strong></TableCell>
                            <TableCell><strong>Usage</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {apiKeys.map(key => (
                            <TableRow key={key._id} hover>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{key.apiName}</p>
                                        <p className="text-xs text-gray-500">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                            {showSecrets[key._id] ? key.apiKey : (key.apiKey?.substring(0, 15) + '...')}
                                        </code>
                                        <Tooltip title={showSecrets[key._id] ? "Hide" : "Show"}>
                                            <IconButton size="small" onClick={() => toggleShowSecret(key._id)}>
                                                {showSecrets[key._id] ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Copy">
                                            <IconButton size="small" onClick={() => copyToClipboard(key.apiKey)}><MdContentCopy size={16} /></IconButton>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                                <TableCell>{key.rateLimit}/hr</TableCell>
                                <TableCell>{key.usageCount || 0} calls</TableCell>
                                <TableCell>
                                    <Switch checked={key.isActive} onChange={(e) => toggleKey(key._id, e.target.checked)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" color="error" onClick={() => deleteKey(key._id)}><MdDelete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {apiKeys.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <FiKey size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No API keys created yet</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create API Key Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <TextField fullWidth label="API Key Name" placeholder="e.g., Mobile App, Website" value={newApiKey.apiName} onChange={(e) => setNewApiKey({ ...newApiKey, apiName: e.target.value })} />
                        <TextField fullWidth label="Rate Limit (requests per hour)" type="number" value={newApiKey.rateLimit} onChange={(e) => setNewApiKey({ ...newApiKey, rateLimit: parseInt(e.target.value) })} />
                        <TextField fullWidth label="Allowed Origins (comma separated)" placeholder="https://example.com, https://app.example.com" value={newApiKey.allowedOrigins} onChange={(e) => setNewApiKey({ ...newApiKey, allowedOrigins: e.target.value })} helperText="Leave empty to allow all origins" />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={createKey}>Generate Key</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ApiManagement;
