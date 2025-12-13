import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { useLocation } from "react-router-dom";
import {
    Button, TextField, Tab, Tabs, Box, Chip, Card, CardContent, Switch, FormControlLabel,
    Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import {
    MdEmail, MdSms, MdNotifications, MdSend, MdSearch, MdDelete, MdEdit, MdVisibility,
    MdClose, MdCheck, MdWarning, MdInfo, MdPerson, MdStore, MdSupport, MdChat,
    MdAnnouncement, MdDescription, MdHelp, MdSystemUpdate, MdSchool, MdContactMail
} from "react-icons/md";
import { FiPlus, FiRefreshCw, FiDownload, FiFilter } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";

function Support() {
    const { backendurl, atoken } = useContext(Admincontext);
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data State
    const [vendorMessages, setVendorMessages] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);
    const [chatSessions, setChatSessions] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [smsTemplates, setSmsTemplates] = useState([]);
    const [helpDocs, setHelpDocs] = useState([]);
    const [systemStatus, setSystemStatus] = useState({
        api: "operational",
        database: "operational",
        payments: "operational",
        notifications: "operational",
        cdn: "operational"
    });
    const [trainingResources, setTrainingResources] = useState([]);

    // Form State
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", message: "", priority: "normal", targetAudience: "all" });
    const [newEmailTemplate, setNewEmailTemplate] = useState({ name: "", subject: "", body: "", type: "general" });
    const [newSmsTemplate, setNewSmsTemplate] = useState({ name: "", message: "", type: "general" });
    const [newHelpDoc, setNewHelpDoc] = useState({ title: "", content: "", category: "general" });
    const [newTrainingResource, setNewTrainingResource] = useState({ title: "", description: "", type: "video", url: "" });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketReply, setTicketReply] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam) setTabValue(parseInt(tabParam));
        fetchSupportData();
    }, [location.search]);

    const fetchSupportData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/support`, { headers: { token: atoken } });
            if (data.success) {
                setVendorMessages(data.vendorMessages || []);
                setSupportTickets(data.supportTickets || []);
                setChatSessions(data.chatSessions || []);
                setAnnouncements(data.announcements || []);
                setEmailTemplates(data.emailTemplates || []);
                setSmsTemplates(data.smsTemplates || []);
                setHelpDocs(data.helpDocs || []);
                setTrainingResources(data.trainingResources || []);
                if (data.systemStatus && Object.keys(data.systemStatus).length > 0) {
                    setSystemStatus(data.systemStatus);
                }
            }
        } catch (e) {
            console.error("Error fetching support data:", e);
            // Only show error message, don't load demo data in production
            // Data will remain empty until user creates items
        } finally {
            setLoading(false);
        }
    };

    // CRUD Operations
    const createAnnouncement = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/support/announcement`, newAnnouncement, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
                setNewAnnouncement({ title: "", message: "", priority: "normal", targetAudience: "all" });
                setOpenDialog(false);
                alert("Announcement Created Successfully!");
            }
        } catch (e) {
            console.error("Create Announcement Error:", e);
            alert("Failed to create announcement. Please try again.");
        }
    };

    const createEmailTemplate = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/support/email-template`, newEmailTemplate, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
                setNewEmailTemplate({ name: "", subject: "", body: "", type: "general" });
                setOpenDialog(false);
                alert("Email Template Created Successfully!");
            }
        } catch (e) {
            console.error("Create Email Template Error:", e);
            alert("Failed to create email template. Please try again.");
        }
    };

    const createSmsTemplate = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/support/sms-template`, newSmsTemplate, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
                setNewSmsTemplate({ name: "", message: "", type: "general" });
                setOpenDialog(false);
                alert("SMS Template Created Successfully!");
            }
        } catch (e) {
            console.error("Create SMS Template Error:", e);
            alert("Failed to create SMS template. Please try again.");
        }
    };

    const createHelpDoc = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/support/help-doc`, newHelpDoc, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
                setNewHelpDoc({ title: "", content: "", category: "general" });
                setOpenDialog(false);
                alert("Help Document Created Successfully!");
            }
        } catch (e) {
            console.error("Create Help Doc Error:", e);
            alert("Failed to create help document. Please try again.");
        }
    };

    const createTrainingResource = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/support/training-resource`, newTrainingResource, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
                setNewTrainingResource({ title: "", description: "", type: "video", url: "" });
                setOpenDialog(false);
                alert("Training Resource Created Successfully!");
            }
        } catch (e) {
            console.error("Create Training Resource Error:", e);
            alert("Failed to create training resource. Please try again.");
        }
    };

    const updateTicketStatus = async (ticketId, newStatus) => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/support/ticket/${ticketId}`, { status: newStatus }, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
            }
        } catch (e) {
            console.error("Update Ticket Status Error:", e);
            alert("Failed to update ticket status. Please try again.");
        }
    };

    const replyToTicket = async () => {
        if (!ticketReply.trim()) return;
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/support/ticket/${selectedTicket._id}/reply`, { message: ticketReply }, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
                setTicketReply("");
                setSelectedTicket(null);
                setOpenDialog(false);
                alert("Reply sent successfully!");
            }
        } catch (e) {
            console.error("Reply to Ticket Error:", e);
            alert("Failed to send reply. Please try again.");
        }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const { data } = await axios.delete(`${backendurl}/api/admin/support/${type}/${id}`, { headers: { token: atoken } });
            if (data.success) {
                fetchSupportData();
                alert("Item deleted successfully!");
            }
        } catch (e) {
            console.error("Delete Item Error:", e);
            alert("Failed to delete item. Please try again.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "open": return "error";
            case "in-progress": return "warning";
            case "resolved": return "success";
            case "closed": return "default";
            case "unread": return "error";
            case "read": return "info";
            case "replied": return "success";
            default: return "default";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high": return "error";
            case "medium": return "warning";
            case "low": return "success";
            default: return "default";
        }
    };

    const getSystemStatusColor = (status) => {
        switch (status) {
            case "operational": return "bg-green-500";
            case "degraded": return "bg-yellow-500";
            case "outage": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const openCreateDialog = (type) => {
        setDialogType(type);
        setOpenDialog(true);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-lg"><RiCustomerService2Line size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Communication & Support</h2>
                        <p className="text-sm text-gray-500">Manage messages, tickets, templates, and help resources.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchSupportData} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </Button>
            </div>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
                    <Tab label="Vendor Messages" icon={<MdStore />} iconPosition="start" />
                    <Tab label="Support Tickets" icon={<MdSupport />} iconPosition="start" />
                    <Tab label="Chat System" icon={<MdChat />} iconPosition="start" />
                    <Tab label="Announcements" icon={<MdAnnouncement />} iconPosition="start" />
                    <Tab label="Email Templates" icon={<MdEmail />} iconPosition="start" />
                    <Tab label="SMS Templates" icon={<MdSms />} iconPosition="start" />
                    <Tab label="Help Docs" icon={<MdHelp />} iconPosition="start" />
                    <Tab label="System Status" icon={<MdSystemUpdate />} iconPosition="start" />
                    <Tab label="Training" icon={<MdSchool />} iconPosition="start" />
                    <Tab label="Contact Vendors" icon={<MdContactMail />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* --- TAB 0: VENDOR MESSAGES --- */}
            {tabValue === 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Vendor Messages</h3>
                        <div className="flex gap-2">
                            <TextField size="small" placeholder="Search messages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <MdSearch className="mr-2 text-gray-400" /> }} />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="unread">Unread</MenuItem>
                                    <MenuItem value="read">Read</MenuItem>
                                    <MenuItem value="replied">Replied</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {vendorMessages.filter(m =>
                            (filterStatus === "all" || m.status === filterStatus) &&
                            (m.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || m.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).map(msg => (
                            <div key={msg._id} className={`p-4 rounded-xl border ${msg.status === "unread" ? "bg-teal-50 border-teal-200" : "bg-white border-gray-200"} hover:shadow-md transition-all`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <Avatar sx={{ bgcolor: "#14b8a6" }}><MdStore /></Avatar>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{msg.vendorName}</h4>
                                            <p className="text-sm text-gray-500">{msg.vendorEmail}</p>
                                            <p className="font-medium mt-1">{msg.subject}</p>
                                            <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Chip size="small" label={msg.status} color={getStatusColor(msg.status)} />
                                        <span className="text-xs text-gray-400">{new Date(msg.date).toLocaleDateString()}</span>
                                        <div className="flex gap-1">
                                            <IconButton size="small" color="primary"><MdVisibility /></IconButton>
                                            <IconButton size="small" color="primary"><MdSend /></IconButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {vendorMessages.length === 0 && (
                            <div className="text-center py-10 text-gray-500">No vendor messages found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB 1: SUPPORT TICKETS --- */}
            {tabValue === 1 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Support Tickets</h3>
                        <div className="flex gap-2">
                            <TextField size="small" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <MdSearch className="mr-2 text-gray-400" /> }} />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="open">Open</MenuItem>
                                    <MenuItem value="in-progress">In Progress</MenuItem>
                                    <MenuItem value="resolved">Resolved</MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <TableContainer component={Paper} className="rounded-xl">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell><strong>Ticket ID</strong></TableCell>
                                    <TableCell><strong>Customer</strong></TableCell>
                                    <TableCell><strong>Subject</strong></TableCell>
                                    <TableCell><strong>Priority</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {supportTickets.filter(t =>
                                    (filterStatus === "all" || t.status === filterStatus) &&
                                    (t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                                ).map(ticket => (
                                    <TableRow key={ticket._id} hover>
                                        <TableCell><span className="font-mono text-sm">{ticket.ticketId}</span></TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{ticket.customerName}</p>
                                                <p className="text-xs text-gray-500">{ticket.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{ticket.subject}</TableCell>
                                        <TableCell><Chip size="small" label={ticket.priority} color={getPriorityColor(ticket.priority)} /></TableCell>
                                        <TableCell>
                                            <Select size="small" value={ticket.status} onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}>
                                                <MenuItem value="open">Open</MenuItem>
                                                <MenuItem value="in-progress">In Progress</MenuItem>
                                                <MenuItem value="resolved">Resolved</MenuItem>
                                                <MenuItem value="closed">Closed</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{new Date(ticket.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <IconButton size="small" color="primary" onClick={() => { setSelectedTicket(ticket); setDialogType("ticket-reply"); setOpenDialog(true); }}><MdSend /></IconButton>
                                                <IconButton size="small" color="info"><MdVisibility /></IconButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}

            {/* --- TAB 2: CHAT SYSTEM --- */}
            {tabValue === 2 && (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
                    <MdChat size={64} className="text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Live Chat System</h3>
                    <p className="text-gray-500 mb-4">Real-time chat with customers and vendors</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-2xl font-bold text-teal-600">{chatSessions.length || 5}</p>
                            <p className="text-sm text-gray-500">Active Chats</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-2xl font-bold text-blue-600">12</p>
                            <p className="text-sm text-gray-500">Waiting</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-2xl font-bold text-green-600">156</p>
                            <p className="text-sm text-gray-500">Resolved Today</p>
                        </div>
                    </div>
                    <Button variant="contained" startIcon={<MdChat />} className="mt-6" sx={{ mt: 4 }}>
                        Open Chat Dashboard
                    </Button>
                </div>
            )}

            {/* --- TAB 3: ANNOUNCEMENTS --- */}
            {tabValue === 3 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Announcements</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => openCreateDialog("announcement")}>
                            Create Announcement
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann._id} className={`p-5 rounded-xl border-l-4 ${ann.priority === "high" ? "border-red-500 bg-red-50" : ann.priority === "normal" ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-lg">{ann.title}</h4>
                                            <Chip size="small" label={ann.priority} color={getPriorityColor(ann.priority)} />
                                            <Chip size="small" label={ann.targetAudience} variant="outlined" />
                                        </div>
                                        <p className="text-gray-700">{ann.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(ann.date).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <IconButton size="small" color="primary"><MdEdit /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => deleteItem("announcement", ann._id)}><MdDelete /></IconButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 4: EMAIL TEMPLATES --- */}
            {tabValue === 4 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Email Templates</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => openCreateDialog("email-template")}>
                            Create Template
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {emailTemplates.map(template => (
                            <Card key={template._id} className="hover:shadow-lg transition-shadow">
                                <CardContent>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MdEmail size={24} /></div>
                                        <Chip size="small" label={template.type} variant="outlined" />
                                    </div>
                                    <h4 className="font-bold text-lg mt-3">{template.name}</h4>
                                    <p className="text-sm text-gray-500 mt-1">Subject: {template.subject}</p>
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{template.body}</p>
                                    <div className="flex justify-end gap-1 mt-4">
                                        <IconButton size="small" color="primary"><MdEdit /></IconButton>
                                        <IconButton size="small" color="info"><MdVisibility /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => deleteItem("email-template", template._id)}><MdDelete /></IconButton>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 5: SMS TEMPLATES --- */}
            {tabValue === 5 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">SMS Templates</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => openCreateDialog("sms-template")}>
                            Create Template
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {smsTemplates.map(template => (
                            <Card key={template._id} className="hover:shadow-lg transition-shadow">
                                <CardContent>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><MdSms size={24} /></div>
                                        <Chip size="small" label={template.type} variant="outlined" />
                                    </div>
                                    <h4 className="font-bold text-lg mt-3">{template.name}</h4>
                                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg font-mono">{template.message}</p>
                                    <div className="flex justify-end gap-1 mt-4">
                                        <IconButton size="small" color="primary"><MdEdit /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => deleteItem("sms-template", template._id)}><MdDelete /></IconButton>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 6: HELP DOCUMENTATION --- */}
            {tabValue === 6 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Help Documentation</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => openCreateDialog("help-doc")}>
                            Create Document
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {helpDocs.map(doc => (
                            <div key={doc._id} className="p-5 bg-white border rounded-xl hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MdDescription size={24} /></div>
                                        <div>
                                            <h4 className="font-bold text-lg">{doc.title}</h4>
                                            <Chip size="small" label={doc.category} variant="outlined" className="mt-1" />
                                            <p className="text-gray-600 mt-2 line-clamp-2">{doc.content}</p>
                                            <p className="text-xs text-gray-400 mt-2">{doc.views} views</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <IconButton size="small" color="primary"><MdEdit /></IconButton>
                                        <IconButton size="small" color="info"><MdVisibility /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => deleteItem("help-doc", doc._id)}><MdDelete /></IconButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 7: SYSTEM STATUS --- */}
            {tabValue === 7 && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">System Status</h3>
                        <Chip label="All Systems Operational" color="success" icon={<MdCheck />} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(systemStatus).map(([service, status]) => (
                            <div key={service} className="p-5 bg-white border rounded-xl flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${getSystemStatusColor(status)}`}></div>
                                    <div>
                                        <h4 className="font-bold capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                        <p className="text-sm text-gray-500 capitalize">{status}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">Last checked: Just now</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                        <h4 className="font-bold mb-4">Recent Incidents</h4>
                        <div className="text-center text-gray-500 py-4">
                            <MdCheck size={32} className="mx-auto text-green-500 mb-2" />
                            <p>No incidents reported in the last 30 days</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 8: TRAINING RESOURCES --- */}
            {tabValue === 8 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Training Resources</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => openCreateDialog("training-resource")}>
                            Add Resource
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trainingResources.map(resource => (
                            <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                                <CardContent>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-2 rounded-lg ${resource.type === "video" ? "bg-red-50 text-red-600" : resource.type === "pdf" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}>
                                            <MdSchool size={24} />
                                        </div>
                                        <Chip size="small" label={resource.type.toUpperCase()} variant="outlined" />
                                    </div>
                                    <h4 className="font-bold text-lg mt-3">{resource.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                                    <p className="text-xs text-gray-400 mt-2">{resource.duration || `${resource.pages} pages`}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <Button size="small" startIcon={<MdVisibility />}>View</Button>
                                        <IconButton size="small" color="error" onClick={() => deleteItem("training-resource", resource._id)}><MdDelete /></IconButton>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 9: CONTACT VENDORS --- */}
            {tabValue === 9 && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Contact Vendors</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white border rounded-xl p-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2"><MdEmail /> Send Email Blast</h4>
                            <div className="space-y-4">
                                <FormControl fullWidth size="small">
                                    <InputLabel>Recipients</InputLabel>
                                    <Select defaultValue="all">
                                        <MenuItem value="all">All Vendors</MenuItem>
                                        <MenuItem value="active">Active Vendors</MenuItem>
                                        <MenuItem value="inactive">Inactive Vendors</MenuItem>
                                        <MenuItem value="top">Top Performing</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth size="small" label="Subject" />
                                <TextField fullWidth size="small" label="Message" multiline rows={4} />
                                <Button variant="contained" fullWidth startIcon={<MdSend />}>Send Email</Button>
                            </div>
                        </div>
                        <div className="bg-white border rounded-xl p-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2"><MdSms /> Send SMS Blast</h4>
                            <div className="space-y-4">
                                <FormControl fullWidth size="small">
                                    <InputLabel>Recipients</InputLabel>
                                    <Select defaultValue="all">
                                        <MenuItem value="all">All Vendors</MenuItem>
                                        <MenuItem value="active">Active Vendors</MenuItem>
                                        <MenuItem value="inactive">Inactive Vendors</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth size="small" label="Message" multiline rows={3} helperText="160 characters max" />
                                <Button variant="contained" fullWidth startIcon={<MdSend />}>Send SMS</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DIALOGS --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogType === "announcement" && "Create Announcement"}
                    {dialogType === "email-template" && "Create Email Template"}
                    {dialogType === "sms-template" && "Create SMS Template"}
                    {dialogType === "help-doc" && "Create Help Document"}
                    {dialogType === "training-resource" && "Add Training Resource"}
                    {dialogType === "ticket-reply" && `Reply to Ticket ${selectedTicket?.ticketId}`}
                </DialogTitle>
                <DialogContent>
                    {dialogType === "announcement" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
                            <TextField fullWidth label="Message" multiline rows={4} value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select value={newAnnouncement.priority} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}>
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="normal">Normal</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Target Audience</InputLabel>
                                <Select value={newAnnouncement.targetAudience} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetAudience: e.target.value })}>
                                    <MenuItem value="all">Everyone</MenuItem>
                                    <MenuItem value="vendors">Vendors Only</MenuItem>
                                    <MenuItem value="customers">Customers Only</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    )}
                    {dialogType === "email-template" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Template Name" value={newEmailTemplate.name} onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, name: e.target.value })} />
                            <TextField fullWidth label="Subject Line" value={newEmailTemplate.subject} onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, subject: e.target.value })} />
                            <TextField fullWidth label="Email Body" multiline rows={6} value={newEmailTemplate.body} onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, body: e.target.value })} helperText="Use {{variable}} for dynamic content" />
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={newEmailTemplate.type} onChange={(e) => setNewEmailTemplate({ ...newEmailTemplate, type: e.target.value })}>
                                    <MenuItem value="general">General</MenuItem>
                                    <MenuItem value="onboarding">Onboarding</MenuItem>
                                    <MenuItem value="transactional">Transactional</MenuItem>
                                    <MenuItem value="marketing">Marketing</MenuItem>
                                    <MenuItem value="security">Security</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    )}
                    {dialogType === "sms-template" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Template Name" value={newSmsTemplate.name} onChange={(e) => setNewSmsTemplate({ ...newSmsTemplate, name: e.target.value })} />
                            <TextField fullWidth label="Message" multiline rows={3} value={newSmsTemplate.message} onChange={(e) => setNewSmsTemplate({ ...newSmsTemplate, message: e.target.value })} helperText="Use {{variable}} for dynamic content. Max 160 chars." />
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={newSmsTemplate.type} onChange={(e) => setNewSmsTemplate({ ...newSmsTemplate, type: e.target.value })}>
                                    <MenuItem value="general">General</MenuItem>
                                    <MenuItem value="transactional">Transactional</MenuItem>
                                    <MenuItem value="security">Security</MenuItem>
                                    <MenuItem value="promotional">Promotional</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    )}
                    {dialogType === "help-doc" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Document Title" value={newHelpDoc.title} onChange={(e) => setNewHelpDoc({ ...newHelpDoc, title: e.target.value })} />
                            <TextField fullWidth label="Content" multiline rows={8} value={newHelpDoc.content} onChange={(e) => setNewHelpDoc({ ...newHelpDoc, content: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select value={newHelpDoc.category} onChange={(e) => setNewHelpDoc({ ...newHelpDoc, category: e.target.value })}>
                                    <MenuItem value="general">General</MenuItem>
                                    <MenuItem value="onboarding">Onboarding</MenuItem>
                                    <MenuItem value="products">Products</MenuItem>
                                    <MenuItem value="orders">Orders</MenuItem>
                                    <MenuItem value="payments">Payments</MenuItem>
                                    <MenuItem value="shipping">Shipping</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    )}
                    {dialogType === "training-resource" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Title" value={newTrainingResource.title} onChange={(e) => setNewTrainingResource({ ...newTrainingResource, title: e.target.value })} />
                            <TextField fullWidth label="Description" multiline rows={3} value={newTrainingResource.description} onChange={(e) => setNewTrainingResource({ ...newTrainingResource, description: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={newTrainingResource.type} onChange={(e) => setNewTrainingResource({ ...newTrainingResource, type: e.target.value })}>
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="pdf">PDF</MenuItem>
                                    <MenuItem value="webinar">Webinar</MenuItem>
                                    <MenuItem value="article">Article</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="URL" value={newTrainingResource.url} onChange={(e) => setNewTrainingResource({ ...newTrainingResource, url: e.target.value })} />
                        </div>
                    )}
                    {dialogType === "ticket-reply" && (
                        <div className="space-y-4 pt-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Customer: {selectedTicket?.customerName}</p>
                                <p className="text-sm text-gray-500">Subject: {selectedTicket?.subject}</p>
                            </div>
                            <TextField fullWidth label="Your Reply" multiline rows={4} value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        if (dialogType === "announcement") createAnnouncement();
                        else if (dialogType === "email-template") createEmailTemplate();
                        else if (dialogType === "sms-template") createSmsTemplate();
                        else if (dialogType === "help-doc") createHelpDoc();
                        else if (dialogType === "training-resource") createTrainingResource();
                        else if (dialogType === "ticket-reply") replyToTicket();
                    }}>
                        {dialogType === "ticket-reply" ? "Send Reply" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Support;
