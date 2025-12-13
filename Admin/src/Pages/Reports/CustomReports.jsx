import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from "@mui/material";
import { MdAssignment, MdDelete, MdEdit, MdPlayArrow, MdSchedule } from "react-icons/md";
import { FiRefreshCw, FiPlus, FiFileText } from "react-icons/fi";

function CustomReports() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [reports, setReports] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editReport, setEditReport] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', reportType: 'sales',
        schedule: { enabled: false, frequency: 'weekly', recipients: '' }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/reports/custom`, { headers: { token: atoken } });
            if (data.success) setReports(data.reports || []);
        } catch (e) {
            console.error("Error fetching custom reports:", e);
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditReport(null);
        setForm({ name: '', description: '', reportType: 'sales', schedule: { enabled: false, frequency: 'weekly', recipients: '' } });
        setOpenDialog(true);
    };

    const openEditDialog = (report) => {
        setEditReport(report);
        setForm({
            name: report.name,
            description: report.description || '',
            reportType: report.reportType,
            schedule: report.schedule || { enabled: false, frequency: 'weekly', recipients: '' }
        });
        setOpenDialog(true);
    };

    const saveReport = async () => {
        if (!form.name) return;
        try {
            const payload = {
                ...form,
                schedule: {
                    ...form.schedule,
                    recipients: form.schedule.recipients ? form.schedule.recipients.split(',').map(e => e.trim()) : []
                }
            };

            if (editReport) {
                await axios.put(`${backendurl}/api/admin/reports/custom/${editReport._id}`, payload, { headers: { token: atoken } });
                setSuccess("Report updated!");
            } else {
                await axios.post(`${backendurl}/api/admin/reports/custom`, payload, { headers: { token: atoken } });
                setSuccess("Report created!");
            }
            fetchData();
            setOpenDialog(false);
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to save report");
        }
    };

    const deleteReport = async (id) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            await axios.delete(`${backendurl}/api/admin/reports/custom/${id}`, { headers: { token: atoken } });
            fetchData();
            setSuccess("Report deleted!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to delete report");
        }
    };

    const runReport = async (id) => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/reports/custom/${id}/run`, {}, { headers: { token: atoken } });
            if (data.success) {
                setSuccess(`Report generated! ${data.data?.length || 0} records found.`);
                fetchData();
                setTimeout(() => setSuccess(""), 5000);
            }
        } catch (e) {
            alert("Failed to run report");
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'sales': return 'primary';
            case 'customers': return 'secondary';
            case 'vendors': return 'warning';
            case 'products': return 'success';
            default: return 'default';
        }
    };

    const reportTypes = [
        { value: 'sales', label: 'Sales Report' },
        { value: 'customers', label: 'Customer Report' },
        { value: 'vendors', label: 'Vendor Report' },
        { value: 'products', label: 'Product Report' },
        { value: 'inventory', label: 'Inventory Report' },
        { value: 'custom', label: 'Custom' }
    ];

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><MdAssignment size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Custom Reports</h2>
                        <p className="text-sm text-gray-500">Create and schedule custom reports.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<FiPlus />} onClick={openCreateDialog}>Create Report</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Reports Table */}
            <TableContainer component={Paper} className="rounded-xl">
                <Table>
                    <TableHead className="bg-gray-50">
                        <TableRow>
                            <TableCell><strong>Report Name</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell align="center"><strong>Schedule</strong></TableCell>
                            <TableCell><strong>Last Run</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((report, idx) => (
                            <TableRow key={report._id || idx} hover>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                            <FiFileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{report.name}</p>
                                            {report.description && <p className="text-xs text-gray-500">{report.description}</p>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip size="small" label={report.reportType} color={getTypeColor(report.reportType)} />
                                </TableCell>
                                <TableCell align="center">
                                    {report.schedule?.enabled ? (
                                        <Chip size="small" icon={<MdSchedule />} label={report.schedule.frequency} color="info" variant="outlined" />
                                    ) : (
                                        <span className="text-gray-400">Manual</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {report.lastRun ? new Date(report.lastRun).toLocaleString() : '-'}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" color="success" onClick={() => runReport(report._id)} title="Run Report"><MdPlayArrow /></IconButton>
                                    <IconButton size="small" color="primary" onClick={() => openEditDialog(report)} title="Edit"><MdEdit /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => deleteReport(report._id)} title="Delete"><MdDelete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {reports.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <MdAssignment size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No custom reports yet</p>
                                    <Button variant="outlined" startIcon={<FiPlus />} onClick={openCreateDialog} sx={{ mt: 2 }}>Create Your First Report</Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editReport ? 'Edit Report' : 'Create Report'}</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <TextField fullWidth label="Report Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Report Type</InputLabel>
                            <Select value={form.reportType} onChange={(e) => setForm({ ...form, reportType: e.target.value })}>
                                {reportTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <h4 className="font-bold mt-4">Schedule Settings</h4>
                        <FormControlLabel
                            control={<Switch checked={form.schedule.enabled} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, enabled: e.target.checked } })} />}
                            label="Enable Scheduled Runs"
                        />
                        {form.schedule.enabled && (
                            <>
                                <FormControl fullWidth>
                                    <InputLabel>Frequency</InputLabel>
                                    <Select value={form.schedule.frequency} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, frequency: e.target.value } })}>
                                        <MenuItem value="daily">Daily</MenuItem>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth label="Email Recipients (comma separated)" value={form.schedule.recipients} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, recipients: e.target.value } })} />
                            </>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveReport}>{editReport ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default CustomReports;
