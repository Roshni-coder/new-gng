import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, Switch, FormControlLabel, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import { MdBackup, MdDelete, MdCloudDownload, MdSchedule } from "react-icons/md";
import { FiRefreshCw, FiSave, FiDatabase, FiDownload } from "react-icons/fi";

function DataBackup() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [success, setSuccess] = useState("");
    const [backups, setBackups] = useState([]);
    const [backupSettings, setBackupSettings] = useState({
        autoBackupEnabled: false, frequency: "weekly", time: "02:00",
        retentionCount: 10, storageLocation: "local",
        notifyOnComplete: true, notifyOnFail: true, notifyEmail: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [backupsRes, settingsRes] = await Promise.all([
                axios.get(`${backendurl}/api/admin/settings/backups`, { headers: { token: atoken } }),
                axios.get(`${backendurl}/api/admin/settings/backup-settings`, { headers: { token: atoken } })
            ]);
            if (backupsRes.data.success) setBackups(backupsRes.data.backups || []);
            if (settingsRes.data.success && settingsRes.data.settings) {
                setBackupSettings(prev => ({ ...prev, ...settingsRes.data.settings }));
            }
        } catch (e) {
            console.error("Error fetching backup data:", e);
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        setCreating(true);
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/backup`, { backupType: "full" }, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Backup started! It will complete in a few moments.");
                setTimeout(() => {
                    fetchData();
                    setSuccess("");
                }, 5000);
            }
        } catch (e) {
            alert("Failed to create backup");
        } finally {
            setCreating(false);
        }
    };

    const deleteBackup = async (id) => {
        if (!window.confirm("Are you sure you want to delete this backup?")) return;
        try {
            await axios.delete(`${backendurl}/api/admin/settings/backup/${id}`, { headers: { token: atoken } });
            fetchData();
            setSuccess("Backup deleted!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to delete backup");
        }
    };

    const saveSettings = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/backup-settings`, backupSettings, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Backup settings saved!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save settings");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'running': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg"><MdBackup size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Data Backup</h2>
                        <p className="text-sm text-gray-500">Create and manage database backups.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<FiDatabase />} onClick={createBackup} disabled={creating}>
                        {creating ? "Creating..." : "Create Backup Now"}
                    </Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Auto Backup Settings */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                        <MdSchedule size={24} className="text-blue-500" />
                        <h3 className="text-lg font-bold">Automatic Backup Settings</h3>
                    </div>
                    <FormControlLabel
                        control={<Switch checked={backupSettings.autoBackupEnabled} onChange={(e) => setBackupSettings({ ...backupSettings, autoBackupEnabled: e.target.checked })} />}
                        label="Enable Automatic Backups"
                    />
                    {backupSettings.autoBackupEnabled && (
                        <div className="grid md:grid-cols-4 gap-4 mt-4">
                            <FormControl fullWidth>
                                <InputLabel>Frequency</InputLabel>
                                <Select value={backupSettings.frequency} onChange={(e) => setBackupSettings({ ...backupSettings, frequency: e.target.value })}>
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="Time" type="time" value={backupSettings.time} onChange={(e) => setBackupSettings({ ...backupSettings, time: e.target.value })} InputLabelProps={{ shrink: true }} />
                            <TextField label="Keep Last N Backups" type="number" value={backupSettings.retentionCount} onChange={(e) => setBackupSettings({ ...backupSettings, retentionCount: parseInt(e.target.value) })} />
                            <FormControl fullWidth>
                                <InputLabel>Storage</InputLabel>
                                <Select value={backupSettings.storageLocation} onChange={(e) => setBackupSettings({ ...backupSettings, storageLocation: e.target.value })}>
                                    <MenuItem value="local">Local Storage</MenuItem>
                                    <MenuItem value="s3">Amazon S3</MenuItem>
                                    <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    )}
                    <div className="mt-4 space-y-2">
                        <FormControlLabel control={<Switch size="small" checked={backupSettings.notifyOnComplete} onChange={(e) => setBackupSettings({ ...backupSettings, notifyOnComplete: e.target.checked })} />} label="Notify on completion" />
                        <FormControlLabel control={<Switch size="small" checked={backupSettings.notifyOnFail} onChange={(e) => setBackupSettings({ ...backupSettings, notifyOnFail: e.target.checked })} />} label="Notify on failure" />
                    </div>
                    {(backupSettings.notifyOnComplete || backupSettings.notifyOnFail) && (
                        <TextField fullWidth label="Notification Email" value={backupSettings.notifyEmail} onChange={(e) => setBackupSettings({ ...backupSettings, notifyEmail: e.target.value })} sx={{ mt: 2 }} />
                    )}
                    <Button variant="outlined" startIcon={<FiSave />} onClick={saveSettings} sx={{ mt: 3 }}>Save Settings</Button>
                </CardContent>
            </Card>

            {/* Backup History */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Backup History</h3>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell><strong>Backup Name</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Size</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Created</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {backups.map(backup => (
                                    <TableRow key={backup._id} hover>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MdCloudDownload className="text-blue-500" />
                                                <span className="font-mono text-sm">{backup.backupName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><Chip size="small" label={backup.backupType} variant="outlined" /></TableCell>
                                        <TableCell>{formatBytes(backup.size)}</TableCell>
                                        <TableCell><Chip size="small" label={backup.status} color={getStatusColor(backup.status)} /></TableCell>
                                        <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary" disabled={backup.status !== 'completed'}><FiDownload /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => deleteBackup(backup._id)}><MdDelete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {backups.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <MdBackup size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No backups created yet</p>
                                            <p className="text-sm text-gray-400">Click "Create Backup Now" to create your first backup</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </div>
    );
}

export default DataBackup;
