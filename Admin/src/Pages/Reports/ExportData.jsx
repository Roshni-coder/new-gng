import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { MdDownload, MdDelete, MdAdd, MdCloudDownload, MdInventory, MdPeople, MdShoppingCart, MdStorefront } from "react-icons/md";
import { FiRefreshCw, FiDownload, FiFile } from "react-icons/fi";

function ExportData() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [success, setSuccess] = useState("");
    const [exports, setExports] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [exportForm, setExportForm] = useState({ exportType: 'orders', format: 'csv' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/reports/exports`, { headers: { token: atoken } });
            if (data.success) setExports(data.logs || []);
        } catch (e) {
            console.error("Error fetching exports:", e);
        } finally {
            setLoading(false);
        }
    };

    const createExport = async () => {
        setExporting(true);
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/reports/export`, exportForm, { headers: { token: atoken } });
            if (data.success) {
                setSuccess(`Export created! ${data.export.recordCount} records exported.`);
                fetchData();
                setOpenDialog(false);
                setTimeout(() => setSuccess(""), 5000);

                // Trigger download if data is available
                if (data.data && data.data.length > 0) {
                    downloadData(data.data, exportForm.exportType, exportForm.format);
                }
            }
        } catch (e) {
            alert("Failed to create export");
        } finally {
            setExporting(false);
        }
    };

    const downloadData = (data, type, format) => {
        let content;
        let mimeType;
        let extension;

        if (format === 'json') {
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        } else {
            // CSV export
            if (data.length === 0) return;
            const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));
            const csvRows = [headers.join(',')];
            data.forEach(row => {
                const values = headers.map(h => {
                    let val = row[h];
                    if (typeof val === 'object') val = JSON.stringify(val);
                    return `"${String(val || '').replace(/"/g, '""')}"`;
                });
                csvRows.push(values.join(','));
            });
            content = csvRows.join('\n');
            mimeType = 'text/csv';
            extension = 'csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const deleteExport = async (id) => {
        if (!window.confirm("Are you sure you want to delete this export log?")) return;
        try {
            await axios.delete(`${backendurl}/api/admin/reports/export/${id}`, { headers: { token: atoken } });
            fetchData();
        } catch (e) {
            alert("Failed to delete export");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "-";
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'orders': return <MdShoppingCart className="text-blue-500" />;
            case 'products': return <MdInventory className="text-green-500" />;
            case 'customers': return <MdPeople className="text-purple-500" />;
            case 'vendors': return <MdStorefront className="text-orange-500" />;
            default: return <FiFile className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const exportTypes = [
        { value: 'orders', label: 'Orders', icon: <MdShoppingCart /> },
        { value: 'products', label: 'Products', icon: <MdInventory /> },
        { value: 'customers', label: 'Customers', icon: <MdPeople /> },
        { value: 'vendors', label: 'Vendors', icon: <MdStorefront /> }
    ];

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><MdCloudDownload size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Export Data</h2>
                        <p className="text-sm text-gray-500">Download your data in various formats.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<MdAdd />} onClick={() => setOpenDialog(true)}>New Export</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Quick Export Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                {exportTypes.map(type => (
                    <Card key={type.value} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => { setExportForm({ exportType: type.value, format: 'csv' }); setOpenDialog(true); }}>
                        <CardContent className="text-center">
                            <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl ${type.value === 'orders' ? 'bg-blue-100 text-blue-600' :
                                    type.value === 'products' ? 'bg-green-100 text-green-600' :
                                        type.value === 'customers' ? 'bg-purple-100 text-purple-600' :
                                            'bg-orange-100 text-orange-600'
                                }`}>
                                {type.icon}
                            </div>
                            <h4 className="font-bold">{type.label}</h4>
                            <p className="text-sm text-gray-500">Export {type.label.toLowerCase()}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Export History */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Export History</h3>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell><strong>Export Type</strong></TableCell>
                                    <TableCell><strong>Format</strong></TableCell>
                                    <TableCell align="right"><strong>Records</strong></TableCell>
                                    <TableCell align="right"><strong>Size</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                    <TableCell><strong>Created</strong></TableCell>
                                    <TableCell align="center"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exports.map((exp, idx) => (
                                    <TableRow key={exp._id || idx} hover>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(exp.exportType)}
                                                <span className="capitalize font-medium">{exp.exportType}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><Chip size="small" label={exp.format?.toUpperCase() || 'CSV'} variant="outlined" /></TableCell>
                                        <TableCell align="right">{exp.recordCount?.toLocaleString() || 0}</TableCell>
                                        <TableCell align="right">{formatBytes(exp.fileSize)}</TableCell>
                                        <TableCell align="center">
                                            <Chip size="small" label={exp.status} color={getStatusColor(exp.status)} />
                                        </TableCell>
                                        <TableCell>{new Date(exp.createdAt).toLocaleString()}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="primary" disabled={exp.status !== 'completed'}><FiDownload /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => deleteExport(exp._id)}><MdDelete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {exports.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12">
                                            <MdCloudDownload size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No exports yet. Create your first export!</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Export Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Export</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <FormControl fullWidth>
                            <InputLabel>Export Type</InputLabel>
                            <Select value={exportForm.exportType} onChange={(e) => setExportForm({ ...exportForm, exportType: e.target.value })}>
                                {exportTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Format</InputLabel>
                            <Select value={exportForm.format} onChange={(e) => setExportForm({ ...exportForm, format: e.target.value })}>
                                <MenuItem value="csv">CSV</MenuItem>
                                <MenuItem value="json">JSON</MenuItem>
                                <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={createExport} disabled={exporting}>
                        {exporting ? "Exporting..." : "Export Data"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ExportData;
