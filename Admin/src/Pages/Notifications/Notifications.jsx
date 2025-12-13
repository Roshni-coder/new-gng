import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { useLocation } from "react-router-dom";
import {
    Button, TextField, Tab, Tabs, Box, Chip, Card, CardContent, Switch, FormControlLabel,
    Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Badge, Tooltip, LinearProgress
} from "@mui/material";
import {
    MdNotifications, MdNotificationsActive, MdShoppingCart, MdSystemUpdate, MdStore,
    MdPerson, MdSettings, MdHistory, MdDelete, MdVisibility, MdCheck, MdClose,
    MdWarning, MdInfo, MdError, MdCheckCircle, MdRefresh, MdFilterList, MdClear
} from "react-icons/md";
import { FiPlus, FiRefreshCw, FiBell, FiAlertCircle, FiTruck, FiUsers } from "react-icons/fi";
import { IoTicketOutline } from "react-icons/io5";

function Notifications() {
    const { backendurl, atoken } = useContext(Admincontext);
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data State
    const [notifications, setNotifications] = useState([]);
    const [orderAlerts, setOrderAlerts] = useState([]);
    const [systemUpdates, setSystemUpdates] = useState([]);
    const [vendorRequests, setVendorRequests] = useState([]);
    const [customerComplaints, setCustomerComplaints] = useState([]);
    const [settings, setSettings] = useState({
        emailNotifications: { orderAlerts: true, vendorRequests: true, customerComplaints: true, systemUpdates: true, lowStock: true, dailyReport: false },
        pushNotifications: { orderAlerts: true, vendorRequests: true, customerComplaints: true, systemUpdates: false },
        smsNotifications: { urgentOrders: false, criticalAlerts: false },
        quietHours: { enabled: false, start: "22:00", end: "08:00" }
    });
    const [activityLogs, setActivityLogs] = useState([]);
    const [stats, setStats] = useState({
        unreadNotifications: 0,
        unreadOrderAlerts: 0,
        pendingVendorRequests: 0,
        newComplaints: 0,
        totalActivityToday: 0
    });

    // Form State
    const [newSystemUpdate, setNewSystemUpdate] = useState({ title: "", description: "", updateType: "announcement", version: "", scheduledAt: "" });
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam) setTabValue(parseInt(tabParam));
        fetchNotificationsData();
    }, [location.search]);

    const fetchNotificationsData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/notifications`, { headers: { token: atoken } });
            if (data.success) {
                setNotifications(data.notifications || []);
                setOrderAlerts(data.orderAlerts || []);
                setSystemUpdates(data.systemUpdates || []);
                setVendorRequests(data.vendorRequests || []);
                setCustomerComplaints(data.customerComplaints || []);
                setActivityLogs(data.activityLogs || []);
                if (data.settings && Object.keys(data.settings).length > 0) {
                    setSettings(data.settings);
                }
                if (data.stats) setStats(data.stats);
            }
        } catch (e) {
            console.error("Error fetching notifications data:", e);
        } finally {
            setLoading(false);
        }
    };

    // CRUD Operations
    const createSystemUpdate = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/notifications/system-update`, newSystemUpdate, { headers: { token: atoken } });
            if (data.success) {
                fetchNotificationsData();
                setNewSystemUpdate({ title: "", description: "", updateType: "announcement", version: "", scheduledAt: "" });
                setOpenDialog(false);
                alert("System Update Created Successfully!");
            }
        } catch (e) {
            console.error("Create System Update Error:", e);
            alert("Failed to create system update. Please try again.");
        }
    };

    const updateVendorRequestStatus = async (id, status) => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/notifications/vendor-request/${id}`, { status }, { headers: { token: atoken } });
            if (data.success) {
                fetchNotificationsData();
            }
        } catch (e) {
            console.error("Update Vendor Request Error:", e);
            alert("Failed to update request status.");
        }
    };

    const updateComplaintStatus = async (id, status, resolution = "") => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/notifications/complaint/${id}`, { status, resolution }, { headers: { token: atoken } });
            if (data.success) {
                fetchNotificationsData();
            }
        } catch (e) {
            console.error("Update Complaint Error:", e);
            alert("Failed to update complaint status.");
        }
    };

    const saveSettings = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/notifications/settings`, settings, { headers: { token: atoken } });
            if (data.success) {
                alert("Settings saved successfully!");
            }
        } catch (e) {
            console.error("Save Settings Error:", e);
            alert("Failed to save settings.");
        }
    };

    const markOrderAlertRead = async (id) => {
        try {
            await axios.put(`${backendurl}/api/admin/notifications/order-alert/${id}/read`, {}, { headers: { token: atoken } });
            fetchNotificationsData();
        } catch (e) {
            console.error("Mark Read Error:", e);
        }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        try {
            const { data } = await axios.delete(`${backendurl}/api/admin/notifications/${type}/${id}`, { headers: { token: atoken } });
            if (data.success) {
                fetchNotificationsData();
                alert("Deleted successfully!");
            }
        } catch (e) {
            console.error("Delete Error:", e);
            alert("Failed to delete.");
        }
    };

    const clearActivityLogs = async () => {
        if (!window.confirm("Clear all activity logs older than 30 days?")) return;
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const { data } = await axios.post(`${backendurl}/api/admin/notifications/activity-logs/clear`, { olderThan: thirtyDaysAgo }, { headers: { token: atoken } });
            if (data.success) {
                fetchNotificationsData();
                alert("Old logs cleared!");
            }
        } catch (e) {
            console.error("Clear Logs Error:", e);
            alert("Failed to clear logs.");
        }
    };

    const getAlertTypeColor = (type) => {
        switch (type) {
            case "new_order": return "success";
            case "payment_received": return "success";
            case "payment_failed": return "error";
            case "order_cancelled": return "error";
            case "refund_requested": return "warning";
            case "delivery_delayed": return "warning";
            default: return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": case "new": return "warning";
            case "in_review": case "investigating": return "info";
            case "approved": case "resolved": case "completed": return "success";
            case "rejected": case "closed": case "cancelled": return "error";
            default: return "default";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent": return "error";
            case "high": return "error";
            case "medium": return "warning";
            case "low": return "success";
            default: return "default";
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case "created": return <FiPlus className="text-green-500" />;
            case "updated": return <MdRefresh className="text-blue-500" />;
            case "deleted": return <MdDelete className="text-red-500" />;
            case "login": return <MdCheck className="text-green-500" />;
            case "logout": return <MdClose className="text-gray-500" />;
            default: return <MdInfo className="text-gray-400" />;
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Badge badgeContent={stats.unreadNotifications + stats.unreadOrderAlerts} color="error">
                            <MdNotificationsActive size={28} />
                        </Badge>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Notifications & Activity</h2>
                        <p className="text-sm text-gray-500">Manage alerts, requests, complaints, and monitor activity.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchNotificationsData} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-80">Unread Alerts</p>
                    <p className="text-2xl font-bold">{stats.unreadOrderAlerts}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-80">Vendor Requests</p>
                    <p className="text-2xl font-bold">{stats.pendingVendorRequests}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-80">New Complaints</p>
                    <p className="text-2xl font-bold">{stats.newComplaints}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-80">Activity Today</p>
                    <p className="text-2xl font-bold">{stats.totalActivityToday}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-80">System Status</p>
                    <p className="text-lg font-bold">Operational</p>
                </div>
            </div>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
                    <Tab label="All Notifications" icon={<MdNotifications />} iconPosition="start" />
                    <Tab label="Order Alerts" icon={<MdShoppingCart />} iconPosition="start" />
                    <Tab label="System Updates" icon={<MdSystemUpdate />} iconPosition="start" />
                    <Tab label="Vendor Requests" icon={<MdStore />} iconPosition="start" />
                    <Tab label="Complaints" icon={<FiAlertCircle />} iconPosition="start" />
                    <Tab label="Settings" icon={<MdSettings />} iconPosition="start" />
                    <Tab label="Activity Logs" icon={<MdHistory />} iconPosition="start" />
                </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* --- TAB 0: ALL NOTIFICATIONS --- */}
            {tabValue === 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">All Notifications</h3>
                        <div className="flex gap-2">
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="order">Orders</MenuItem>
                                    <MenuItem value="system">System</MenuItem>
                                    <MenuItem value="vendor">Vendors</MenuItem>
                                    <MenuItem value="customer">Customers</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {notifications.length === 0 && orderAlerts.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <MdNotifications size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-lg">No notifications yet</p>
                                <p className="text-sm">Notifications will appear here when there's activity</p>
                            </div>
                        ) : (
                            [...orderAlerts, ...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20).map((item, index) => (
                                <div key={item._id || index} className={`p-4 rounded-xl border ${item.isRead ? "bg-white border-gray-200" : "bg-yellow-50 border-yellow-200"} hover:shadow-md transition-all`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <Avatar sx={{ bgcolor: item.alertType ? "#3b82f6" : "#eab308" }}>
                                                {item.alertType ? <MdShoppingCart /> : <MdNotifications />}
                                            </Avatar>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{item.title || item.message}</h4>
                                                {item.customerName && <p className="text-sm text-gray-500">Customer: {item.customerName}</p>}
                                                {item.orderNumber && <p className="text-sm text-gray-500">Order: {item.orderNumber}</p>}
                                                <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {item.alertType && <Chip size="small" label={item.alertType.replace(/_/g, ' ')} color={getAlertTypeColor(item.alertType)} />}
                                            {item.priority && <Chip size="small" label={item.priority} color={getPriorityColor(item.priority)} variant="outlined" />}
                                            <div className="flex gap-1">
                                                {!item.isRead && (
                                                    <Tooltip title="Mark as read">
                                                        <IconButton size="small" color="primary" onClick={() => markOrderAlertRead(item._id)}><MdCheck /></IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => deleteItem("order-alert", item._id)}><MdDelete /></IconButton>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB 1: ORDER ALERTS --- */}
            {tabValue === 1 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Order Alerts</h3>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <MenuItem value="all">All Alerts</MenuItem>
                                <MenuItem value="new_order">New Orders</MenuItem>
                                <MenuItem value="payment_received">Payment Received</MenuItem>
                                <MenuItem value="payment_failed">Payment Failed</MenuItem>
                                <MenuItem value="order_cancelled">Cancelled</MenuItem>
                                <MenuItem value="refund_requested">Refund Requested</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="space-y-3">
                        {orderAlerts.filter(a => filterType === "all" || a.alertType === filterType).map(alert => (
                            <div key={alert._id} className={`p-4 rounded-xl border ${alert.isRead ? "bg-white" : "bg-blue-50 border-blue-200"} hover:shadow-md transition-all`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <Avatar sx={{ bgcolor: alert.alertType.includes("failed") || alert.alertType.includes("cancelled") ? "#ef4444" : "#22c55e" }}>
                                            <MdShoppingCart />
                                        </Avatar>
                                        <div>
                                            <p className="font-bold">{alert.message}</p>
                                            <div className="flex gap-2 mt-1">
                                                {alert.orderNumber && <span className="text-sm text-gray-500">#{alert.orderNumber}</span>}
                                                {alert.customerName && <span className="text-sm text-gray-500">• {alert.customerName}</span>}
                                                {alert.amount && <span className="text-sm font-medium text-green-600">• ₹{alert.amount}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Chip size="small" label={alert.alertType.replace(/_/g, ' ')} color={getAlertTypeColor(alert.alertType)} />
                                        <span className="text-xs text-gray-400">{formatDate(alert.createdAt)}</span>
                                        <IconButton size="small" onClick={() => deleteItem("order-alert", alert._id)}><MdDelete /></IconButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orderAlerts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <MdShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                                <p>No order alerts</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB 2: SYSTEM UPDATES --- */}
            {tabValue === 2 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">System Updates</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => { setDialogType("system-update"); setOpenDialog(true); }}>
                            Add Update
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {systemUpdates.map(update => (
                            <div key={update._id} className={`p-5 rounded-xl border-l-4 ${update.updateType === "maintenance" ? "border-orange-500 bg-orange-50" : update.updateType === "security" ? "border-red-500 bg-red-50" : "border-blue-500 bg-blue-50"}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-lg">{update.title}</h4>
                                            <Chip size="small" label={update.updateType} color={update.updateType === "security" ? "error" : update.updateType === "maintenance" ? "warning" : "info"} />
                                            <Chip size="small" label={update.status} color={getStatusColor(update.status)} variant="outlined" />
                                            {update.version && <Chip size="small" label={`v${update.version}`} variant="outlined" />}
                                        </div>
                                        <p className="text-gray-700">{update.description}</p>
                                        {update.scheduledAt && <p className="text-sm text-gray-500 mt-2">Scheduled: {new Date(update.scheduledAt).toLocaleString()}</p>}
                                        <p className="text-xs text-gray-400 mt-1">Created: {formatDate(update.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <IconButton size="small" color="error" onClick={() => deleteItem("system-update", update._id)}><MdDelete /></IconButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {systemUpdates.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <MdSystemUpdate size={48} className="mx-auto text-gray-300 mb-3" />
                                <p>No system updates</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB 3: VENDOR REQUESTS --- */}
            {tabValue === 3 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Vendor Requests</h3>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in_review">In Review</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <TableContainer component={Paper} className="rounded-xl">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell><strong>Vendor</strong></TableCell>
                                    <TableCell><strong>Request Type</strong></TableCell>
                                    <TableCell><strong>Subject</strong></TableCell>
                                    <TableCell><strong>Priority</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vendorRequests.filter(r => filterStatus === "all" || r.status === filterStatus).map(request => (
                                    <TableRow key={request._id} hover>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: "#10b981" }}><MdStore size={16} /></Avatar>
                                                <div>
                                                    <p className="font-medium">{request.vendorName}</p>
                                                    <p className="text-xs text-gray-500">{request.vendorEmail}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Chip size="small" label={request.requestType.replace(/_/g, ' ')} variant="outlined" /></TableCell>
                                        <TableCell>{request.subject}</TableCell>
                                        <TableCell><Chip size="small" label={request.priority} color={getPriorityColor(request.priority)} /></TableCell>
                                        <TableCell>
                                            <Select size="small" value={request.status} onChange={(e) => updateVendorRequestStatus(request._id, e.target.value)}>
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="in_review">In Review</MenuItem>
                                                <MenuItem value="approved">Approved</MenuItem>
                                                <MenuItem value="rejected">Rejected</MenuItem>
                                                <MenuItem value="resolved">Resolved</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="error" onClick={() => deleteItem("vendor-request", request._id)}><MdDelete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {vendorRequests.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <MdStore size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>No vendor requests</p>
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB 4: CUSTOMER COMPLAINTS --- */}
            {tabValue === 4 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Customer Complaints</h3>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="new">New</MenuItem>
                                <MenuItem value="investigating">Investigating</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                                <MenuItem value="escalated">Escalated</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="space-y-4">
                        {customerComplaints.filter(c => filterStatus === "all" || c.status === filterStatus).map(complaint => (
                            <div key={complaint._id} className={`p-5 rounded-xl border ${complaint.status === "new" ? "border-red-200 bg-red-50" : complaint.status === "escalated" ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <Avatar sx={{ bgcolor: "#ef4444" }}><MdPerson /></Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold">{complaint.customerName}</h4>
                                                <Chip size="small" label={complaint.complaintType.replace(/_/g, ' ')} variant="outlined" />
                                                <Chip size="small" label={complaint.priority} color={getPriorityColor(complaint.priority)} />
                                            </div>
                                            <p className="font-medium text-gray-800">{complaint.subject}</p>
                                            <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                                            <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                                {complaint.orderNumber && <span>Order: #{complaint.orderNumber}</span>}
                                                <span>• {complaint.customerEmail}</span>
                                                <span>• {formatDate(complaint.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Select size="small" value={complaint.status} onChange={(e) => updateComplaintStatus(complaint._id, e.target.value)}>
                                            <MenuItem value="new">New</MenuItem>
                                            <MenuItem value="investigating">Investigating</MenuItem>
                                            <MenuItem value="resolved">Resolved</MenuItem>
                                            <MenuItem value="closed">Closed</MenuItem>
                                            <MenuItem value="escalated">Escalated</MenuItem>
                                        </Select>
                                        <IconButton size="small" color="error" onClick={() => deleteItem("complaint", complaint._id)}><MdDelete /></IconButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {customerComplaints.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <FiAlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
                                <p>No complaints - Great job!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB 5: SETTINGS --- */}
            {tabValue === 5 && (
                <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Notification Settings</h3>

                    {/* Email Notifications */}
                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-4 flex items-center gap-2"><MdNotifications /> Email Notifications</h4>
                            <div className="space-y-3">
                                {Object.entries(settings.emailNotifications || {}).map(([key, value]) => (
                                    <FormControlLabel
                                        key={key}
                                        control={<Switch checked={value} onChange={(e) => setSettings({ ...settings, emailNotifications: { ...settings.emailNotifications, [key]: e.target.checked } })} />}
                                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Push Notifications */}
                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-4 flex items-center gap-2"><FiBell /> Push Notifications</h4>
                            <div className="space-y-3">
                                {Object.entries(settings.pushNotifications || {}).map(([key, value]) => (
                                    <FormControlLabel
                                        key={key}
                                        control={<Switch checked={value} onChange={(e) => setSettings({ ...settings, pushNotifications: { ...settings.pushNotifications, [key]: e.target.checked } })} />}
                                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quiet Hours */}
                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-4">Quiet Hours</h4>
                            <FormControlLabel
                                control={<Switch checked={settings.quietHours?.enabled} onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, enabled: e.target.checked } })} />}
                                label="Enable Quiet Hours"
                            />
                            {settings.quietHours?.enabled && (
                                <div className="flex gap-4 mt-4">
                                    <TextField label="Start Time" type="time" size="small" value={settings.quietHours?.start || "22:00"} onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, start: e.target.value } })} />
                                    <TextField label="End Time" type="time" size="small" value={settings.quietHours?.end || "08:00"} onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, end: e.target.value } })} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button variant="contained" fullWidth onClick={saveSettings}>Save Settings</Button>
                </div>
            )}

            {/* --- TAB 6: ACTIVITY LOGS --- */}
            {tabValue === 6 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Activity Logs</h3>
                        <Button variant="outlined" color="error" startIcon={<MdClear />} onClick={clearActivityLogs}>
                            Clear Old Logs
                        </Button>
                    </div>
                    <TableContainer component={Paper} className="rounded-xl">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell><strong>Action</strong></TableCell>
                                    <TableCell><strong>User</strong></TableCell>
                                    <TableCell><strong>Entity</strong></TableCell>
                                    <TableCell><strong>Description</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Time</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activityLogs.map(log => (
                                    <TableRow key={log._id} hover>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getActionIcon(log.action)}
                                                <span className="capitalize">{log.action}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{log.userName || "System"}</p>
                                                <p className="text-xs text-gray-500">{log.userRole}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="capitalize">{log.entityType || "-"}</p>
                                                {log.entityName && <p className="text-xs text-gray-500">{log.entityName}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{log.description || "-"}</TableCell>
                                        <TableCell><Chip size="small" label={log.status} color={log.status === "success" ? "success" : log.status === "failed" ? "error" : "default"} /></TableCell>
                                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {activityLogs.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <MdHistory size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>No activity logs yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* --- DIALOGS --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogType === "system-update" && "Add System Update"}
                </DialogTitle>
                <DialogContent>
                    {dialogType === "system-update" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Title" value={newSystemUpdate.title} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, title: e.target.value })} />
                            <TextField fullWidth label="Description" multiline rows={4} value={newSystemUpdate.description} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, description: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Update Type</InputLabel>
                                <Select value={newSystemUpdate.updateType} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, updateType: e.target.value })}>
                                    <MenuItem value="announcement">Announcement</MenuItem>
                                    <MenuItem value="maintenance">Maintenance</MenuItem>
                                    <MenuItem value="feature">New Feature</MenuItem>
                                    <MenuItem value="security">Security</MenuItem>
                                    <MenuItem value="performance">Performance</MenuItem>
                                    <MenuItem value="bug_fix">Bug Fix</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="Version (optional)" value={newSystemUpdate.version} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, version: e.target.value })} />
                            <TextField fullWidth label="Scheduled At" type="datetime-local" InputLabelProps={{ shrink: true }} value={newSystemUpdate.scheduledAt} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, scheduledAt: e.target.value })} />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        if (dialogType === "system-update") createSystemUpdate();
                    }}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Notifications;
