import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { useLocation } from "react-router-dom";
import {
    Button, TextField, Tab, Tabs, Box, Chip, Card, CardContent, Switch, FormControlLabel,
    Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Tooltip, LinearProgress, Divider, Alert, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import {
    MdSettings, MdPayment, MdEmail, MdSms, MdSecurity, MdBackup, MdPeople, MdExpandMore,
    MdDelete, MdEdit, MdCheck, MdClose, MdAdd, MdRefresh, MdKey, MdColorLens, MdCardGiftcard,
    MdApi, MdPolicy, MdWebAsset, MdMessage
} from "react-icons/md";
import { FiPlus, FiRefreshCw, FiSave, FiDownload, FiSettings, FiShield, FiDatabase } from "react-icons/fi";
import { BiReceipt } from "react-icons/bi";
import { HiOutlineTemplate } from "react-icons/hi";

function Settings() {
    const { backendurl, atoken } = useContext(Admincontext);
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data State
    const [siteConfig, setSiteConfig] = useState({
        siteName: "", siteUrl: "", logo: "", tagline: "", description: "",
        contactEmail: "", contactPhone: "", address: "",
        socialLinks: { facebook: "", instagram: "", twitter: "", youtube: "" },
        currency: "INR", currencySymbol: "₹", timezone: "Asia/Kolkata", maintenanceMode: false
    });
    const [paymentGateways, setPaymentGateways] = useState([]);
    const [emailSettings, setEmailSettings] = useState({
        provider: "smtp", isActive: false,
        smtp: { host: "", port: 587, secure: false, username: "", password: "" },
        fromEmail: "", fromName: "", replyTo: "", dailyLimit: 500
    });
    const [smsSettings, setSmsSettings] = useState({
        provider: "twilio", isActive: false,
        credentials: { accountSid: "", authToken: "", senderId: "" },
        dailyLimit: 1000
    });
    const [taxConfig, setTaxConfig] = useState({
        taxName: "GST", isEnabled: true, includedInPrice: true, displayOnCheckout: true,
        taxRates: [], taxNumber: ""
    });
    const [apiKeys, setApiKeys] = useState([]);
    const [roles, setRoles] = useState([]);
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: { enabled: false, requiredForAdmin: true, methods: [] },
        passwordPolicy: { minLength: 8, requireUppercase: true, requireNumbers: true },
        loginSecurity: { maxAttempts: 5, lockoutDuration: 30, sessionTimeout: 60 }
    });
    const [gdprSettings, setGdprSettings] = useState({
        cookieConsent: { enabled: true, message: "" },
        dataRetention: { userDataDays: 365, orderDataDays: 730, logDataDays: 90 },
        dataExportEnabled: true, dataDeletionEnabled: true
    });
    const [backups, setBackups] = useState([]);
    const [backupSettings, setBackupSettings] = useState({
        autoBackupEnabled: false, frequency: "weekly", time: "02:00", retentionCount: 10
    });
    const [personalization, setPersonalization] = useState({
        enableRecommendations: true, enableRecentlyViewed: true,
        enableAbandonedCartReminders: true, enableBirthdayOffers: true
    });
    const [messageTemplates, setMessageTemplates] = useState([]);
    const [customization, setCustomization] = useState({
        theme: { primaryColor: "#3B82F6", secondaryColor: "#10B981" },
        checkout: { guestCheckout: true, showCouponField: true, showGiftWrap: true }
    });
    const [greetingCards, setGreetingCards] = useState([]);

    // Form State
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [newRole, setNewRole] = useState({ roleName: "", description: "", permissions: {} });
    const [newApiKey, setNewApiKey] = useState({ apiName: "", rateLimit: 1000 });
    const [newTemplate, setNewTemplate] = useState({ name: "", type: "email", subject: "", body: "" });
    const [newCard, setNewCard] = useState({ title: "", category: "birthday", template: "" });
    const [newTaxRate, setNewTaxRate] = useState({ name: "", rate: 0, category: "" });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam) setTabValue(parseInt(tabParam));
        fetchSettingsData();
    }, [location.search]);

    const fetchSettingsData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings`, { headers: { token: atoken } });
            if (data.success) {
                if (data.siteConfig && Object.keys(data.siteConfig).length > 0) setSiteConfig(prev => ({ ...prev, ...data.siteConfig }));
                setPaymentGateways(data.paymentGateways || []);
                if (data.emailSettings && Object.keys(data.emailSettings).length > 0) setEmailSettings(prev => ({ ...prev, ...data.emailSettings }));
                if (data.smsSettings && Object.keys(data.smsSettings).length > 0) setSmsSettings(prev => ({ ...prev, ...data.smsSettings }));
                if (data.taxConfig && Object.keys(data.taxConfig).length > 0) setTaxConfig(prev => ({ ...prev, ...data.taxConfig }));
                setApiKeys(data.apiKeys || []);
                setRoles(data.roles || []);
                if (data.securitySettings && Object.keys(data.securitySettings).length > 0) setSecuritySettings(prev => ({ ...prev, ...data.securitySettings }));
                if (data.gdprSettings && Object.keys(data.gdprSettings).length > 0) setGdprSettings(prev => ({ ...prev, ...data.gdprSettings }));
                setBackups(data.backups || []);
                if (data.backupSettings && Object.keys(data.backupSettings).length > 0) setBackupSettings(prev => ({ ...prev, ...data.backupSettings }));
                if (data.personalization && Object.keys(data.personalization).length > 0) setPersonalization(prev => ({ ...prev, ...data.personalization }));
                setMessageTemplates(data.messageTemplates || []);
                if (data.customization && Object.keys(data.customization).length > 0) setCustomization(prev => ({ ...prev, ...data.customization }));
                setGreetingCards(data.greetingCards || []);
            }
        } catch (e) {
            console.error("Error fetching settings data:", e);
        } finally {
            setLoading(false);
        }
    };

    // Save functions
    const saveSiteConfig = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/site-config`, siteConfig, { headers: { token: atoken } });
            if (data.success) alert("Site configuration saved!");
        } catch (e) {
            alert("Failed to save site configuration");
        }
    };

    const saveEmailSettings = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/email-settings`, emailSettings, { headers: { token: atoken } });
            if (data.success) alert("Email settings saved!");
        } catch (e) {
            alert("Failed to save email settings");
        }
    };

    const saveSmsSettings = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/sms-settings`, smsSettings, { headers: { token: atoken } });
            if (data.success) alert("SMS settings saved!");
        } catch (e) {
            alert("Failed to save SMS settings");
        }
    };

    const saveTaxConfig = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/tax-config`, taxConfig, { headers: { token: atoken } });
            if (data.success) alert("Tax configuration saved!");
        } catch (e) {
            alert("Failed to save tax configuration");
        }
    };

    const saveSecuritySettings = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/security`, securitySettings, { headers: { token: atoken } });
            if (data.success) alert("Security settings saved!");
        } catch (e) {
            alert("Failed to save security settings");
        }
    };

    const saveGdprSettings = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/gdpr`, gdprSettings, { headers: { token: atoken } });
            if (data.success) alert("GDPR settings saved!");
        } catch (e) {
            alert("Failed to save GDPR settings");
        }
    };

    const saveBackupSettings = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/backup-settings`, backupSettings, { headers: { token: atoken } });
            if (data.success) alert("Backup settings saved!");
        } catch (e) {
            alert("Failed to save backup settings");
        }
    };

    const savePersonalization = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/personalization`, personalization, { headers: { token: atoken } });
            if (data.success) alert("Personalization settings saved!");
        } catch (e) {
            alert("Failed to save personalization settings");
        }
    };

    const saveCustomization = async () => {
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/customization`, customization, { headers: { token: atoken } });
            if (data.success) alert("Customization settings saved!");
        } catch (e) {
            alert("Failed to save customization settings");
        }
    };

    // CRUD functions
    const createApiKey = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/api-key`, newApiKey, { headers: { token: atoken } });
            if (data.success) {
                fetchSettingsData();
                setNewApiKey({ apiName: "", rateLimit: 1000 });
                setOpenDialog(false);
                alert("API Key created!");
            }
        } catch (e) {
            alert("Failed to create API key");
        }
    };

    const createRole = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/role`, newRole, { headers: { token: atoken } });
            if (data.success) {
                fetchSettingsData();
                setNewRole({ roleName: "", description: "", permissions: {} });
                setOpenDialog(false);
                alert("Role created!");
            }
        } catch (e) {
            alert("Failed to create role");
        }
    };

    const createBackup = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/backup`, { backupType: "full" }, { headers: { token: atoken } });
            if (data.success) {
                fetchSettingsData();
                alert("Backup started!");
            }
        } catch (e) {
            alert("Failed to start backup");
        }
    };

    const createMessageTemplate = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/message-template`, newTemplate, { headers: { token: atoken } });
            if (data.success) {
                fetchSettingsData();
                setNewTemplate({ name: "", type: "email", subject: "", body: "" });
                setOpenDialog(false);
                alert("Template created!");
            }
        } catch (e) {
            alert("Failed to create template");
        }
    };

    const createGreetingCard = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/greeting-card`, newCard, { headers: { token: atoken } });
            if (data.success) {
                fetchSettingsData();
                setNewCard({ title: "", category: "birthday", template: "" });
                setOpenDialog(false);
                alert("Greeting card created!");
            }
        } catch (e) {
            alert("Failed to create greeting card");
        }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        try {
            const { data } = await axios.delete(`${backendurl}/api/admin/settings/${type}/${id}`, { headers: { token: atoken } });
            if (data.success) {
                fetchSettingsData();
                alert("Deleted successfully!");
            }
        } catch (e) {
            alert("Failed to delete");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><MdSettings size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Configuration & Settings</h2>
                        <p className="text-sm text-gray-500">Manage platform settings, security, and customizations.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchSettingsData} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </Button>
            </div>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
                    <Tab label="Site Configuration" icon={<MdWebAsset />} iconPosition="start" />
                    <Tab label="Payment Gateway" icon={<MdPayment />} iconPosition="start" />
                    <Tab label="Email Settings" icon={<MdEmail />} iconPosition="start" />
                    <Tab label="SMS Settings" icon={<MdSms />} iconPosition="start" />
                    <Tab label="Tax Configuration" icon={<BiReceipt />} iconPosition="start" />
                    <Tab label="API Management" icon={<MdApi />} iconPosition="start" />
                    <Tab label="User Permissions" icon={<MdPeople />} iconPosition="start" />
                    <Tab label="Security" icon={<MdSecurity />} iconPosition="start" />
                    <Tab label="GDPR" icon={<MdPolicy />} iconPosition="start" />
                    <Tab label="Backup" icon={<MdBackup />} iconPosition="start" />
                    <Tab label="Personalization" icon={<FiSettings />} iconPosition="start" />
                    <Tab label="Templates" icon={<HiOutlineTemplate />} iconPosition="start" />
                    <Tab label="Customization" icon={<MdColorLens />} iconPosition="start" />
                    <Tab label="Greeting Cards" icon={<MdCardGiftcard />} iconPosition="start" />
                </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* --- TAB 0: SITE CONFIGURATION --- */}
            {tabValue === 0 && (
                <div className="max-w-3xl">
                    <h3 className="text-lg font-bold mb-4">Site Configuration</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <TextField fullWidth label="Site Name" value={siteConfig.siteName} onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })} />
                        <TextField fullWidth label="Site URL" value={siteConfig.siteUrl} onChange={(e) => setSiteConfig({ ...siteConfig, siteUrl: e.target.value })} />
                        <TextField fullWidth label="Tagline" value={siteConfig.tagline} onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })} />
                        <TextField fullWidth label="Contact Email" value={siteConfig.contactEmail} onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })} />
                        <TextField fullWidth label="Contact Phone" value={siteConfig.contactPhone} onChange={(e) => setSiteConfig({ ...siteConfig, contactPhone: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Currency</InputLabel>
                            <Select value={siteConfig.currency} onChange={(e) => setSiteConfig({ ...siteConfig, currency: e.target.value })}>
                                <MenuItem value="INR">INR (₹)</MenuItem>
                                <MenuItem value="USD">USD ($)</MenuItem>
                                <MenuItem value="EUR">EUR (€)</MenuItem>
                                <MenuItem value="GBP">GBP (£)</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <TextField fullWidth label="Description" multiline rows={3} value={siteConfig.description} onChange={(e) => setSiteConfig({ ...siteConfig, description: e.target.value })} sx={{ mt: 2 }} />
                    <TextField fullWidth label="Address" multiline rows={2} value={siteConfig.address} onChange={(e) => setSiteConfig({ ...siteConfig, address: e.target.value })} sx={{ mt: 2 }} />

                    <h4 className="font-bold mt-6 mb-3">Social Links</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <TextField label="Facebook" value={siteConfig.socialLinks?.facebook || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, facebook: e.target.value } })} />
                        <TextField label="Instagram" value={siteConfig.socialLinks?.instagram || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, instagram: e.target.value } })} />
                        <TextField label="Twitter" value={siteConfig.socialLinks?.twitter || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, twitter: e.target.value } })} />
                        <TextField label="YouTube" value={siteConfig.socialLinks?.youtube || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, youtube: e.target.value } })} />
                    </div>

                    <FormControlLabel
                        control={<Switch checked={siteConfig.maintenanceMode} onChange={(e) => setSiteConfig({ ...siteConfig, maintenanceMode: e.target.checked })} />}
                        label="Maintenance Mode"
                        sx={{ mt: 3 }}
                    />

                    <Button variant="contained" startIcon={<FiSave />} onClick={saveSiteConfig} sx={{ mt: 3 }}>Save Configuration</Button>
                </div>
            )}

            {/* --- TAB 1: PAYMENT GATEWAY --- */}
            {tabValue === 1 && (
                <div>
                    <h3 className="text-lg font-bold mb-4">Payment Gateways</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[{ gateway: 'razorpay', name: 'Razorpay', icon: '💳' }, { gateway: 'stripe', name: 'Stripe', icon: '💎' }, { gateway: 'paypal', name: 'PayPal', icon: '🅿️' }, { gateway: 'cod', name: 'Cash on Delivery', icon: '💵' }].map(gw => {
                            const existing = paymentGateways.find(p => p.gateway === gw.gateway) || { isActive: false, testMode: true };
                            return (
                                <Card key={gw.gateway} className={`${existing.isActive ? 'border-green-500 border-2' : ''}`}>
                                    <CardContent>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{gw.icon}</span>
                                                <h4 className="font-bold">{gw.name}</h4>
                                            </div>
                                            <Switch checked={existing.isActive} onChange={async (e) => {
                                                try {
                                                    await axios.put(`${backendurl}/api/admin/settings/payment-gateway/${gw.gateway}/toggle`, { isActive: e.target.checked }, { headers: { token: atoken } });
                                                    fetchSettingsData();
                                                } catch (err) { console.error(err); }
                                            }} />
                                        </div>
                                        <Chip size="small" label={existing.isActive ? "Active" : "Inactive"} color={existing.isActive ? "success" : "default"} />
                                        {existing.isActive && <Chip size="small" label={existing.testMode ? "Test Mode" : "Live"} color={existing.testMode ? "warning" : "success"} sx={{ ml: 1 }} />}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- TAB 2: EMAIL SETTINGS --- */}
            {tabValue === 2 && (
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Email Settings</h3>
                    <FormControlLabel
                        control={<Switch checked={emailSettings.isActive} onChange={(e) => setEmailSettings({ ...emailSettings, isActive: e.target.checked })} />}
                        label="Enable Email Notifications"
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Provider</InputLabel>
                        <Select value={emailSettings.provider} onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}>
                            <MenuItem value="smtp">SMTP</MenuItem>
                            <MenuItem value="sendgrid">SendGrid</MenuItem>
                            <MenuItem value="mailgun">Mailgun</MenuItem>
                            <MenuItem value="ses">Amazon SES</MenuItem>
                        </Select>
                    </FormControl>

                    {emailSettings.provider === 'smtp' && (
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <TextField label="SMTP Host" value={emailSettings.smtp?.host || ""} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, host: e.target.value } })} />
                            <TextField label="Port" type="number" value={emailSettings.smtp?.port || 587} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, port: parseInt(e.target.value) } })} />
                            <TextField label="Username" value={emailSettings.smtp?.username || ""} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, username: e.target.value } })} />
                            <TextField label="Password" type="password" value={emailSettings.smtp?.password || ""} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, password: e.target.value } })} />
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <TextField label="From Email" value={emailSettings.fromEmail} onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })} />
                        <TextField label="From Name" value={emailSettings.fromName} onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })} />
                        <TextField label="Reply To" value={emailSettings.replyTo} onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })} />
                        <TextField label="Daily Limit" type="number" value={emailSettings.dailyLimit} onChange={(e) => setEmailSettings({ ...emailSettings, dailyLimit: parseInt(e.target.value) })} />
                    </div>

                    <Button variant="contained" startIcon={<FiSave />} onClick={saveEmailSettings} sx={{ mt: 3 }}>Save Email Settings</Button>
                </div>
            )}

            {/* --- TAB 3: SMS SETTINGS --- */}
            {tabValue === 3 && (
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">SMS Settings</h3>
                    <FormControlLabel
                        control={<Switch checked={smsSettings.isActive} onChange={(e) => setSmsSettings({ ...smsSettings, isActive: e.target.checked })} />}
                        label="Enable SMS Notifications"
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Provider</InputLabel>
                        <Select value={smsSettings.provider} onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}>
                            <MenuItem value="twilio">Twilio</MenuItem>
                            <MenuItem value="msg91">MSG91</MenuItem>
                            <MenuItem value="textlocal">TextLocal</MenuItem>
                            <MenuItem value="aws_sns">AWS SNS</MenuItem>
                        </Select>
                    </FormControl>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <TextField label="Account SID / API Key" value={smsSettings.credentials?.accountSid || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, accountSid: e.target.value } })} />
                        <TextField label="Auth Token / Secret" type="password" value={smsSettings.credentials?.authToken || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, authToken: e.target.value } })} />
                        <TextField label="Sender ID" value={smsSettings.credentials?.senderId || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, senderId: e.target.value } })} />
                        <TextField label="Daily Limit" type="number" value={smsSettings.dailyLimit} onChange={(e) => setSmsSettings({ ...smsSettings, dailyLimit: parseInt(e.target.value) })} />
                    </div>

                    <Button variant="contained" startIcon={<FiSave />} onClick={saveSmsSettings} sx={{ mt: 3 }}>Save SMS Settings</Button>
                </div>
            )}

            {/* --- TAB 4: TAX CONFIGURATION --- */}
            {tabValue === 4 && (
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Tax Configuration</h3>
                    <div className="space-y-3 mb-4">
                        <FormControlLabel control={<Switch checked={taxConfig.isEnabled} onChange={(e) => setTaxConfig({ ...taxConfig, isEnabled: e.target.checked })} />} label="Enable Tax Calculation" />
                        <FormControlLabel control={<Switch checked={taxConfig.includedInPrice} onChange={(e) => setTaxConfig({ ...taxConfig, includedInPrice: e.target.checked })} />} label="Tax Included in Price" />
                        <FormControlLabel control={<Switch checked={taxConfig.displayOnCheckout} onChange={(e) => setTaxConfig({ ...taxConfig, displayOnCheckout: e.target.checked })} />} label="Display Tax on Checkout" />
                    </div>
                    <TextField fullWidth label="Tax Number (GST)" value={taxConfig.taxNumber} onChange={(e) => setTaxConfig({ ...taxConfig, taxNumber: e.target.value })} sx={{ mb: 3 }} />

                    <h4 className="font-bold mb-3">Tax Rates</h4>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Rate (%)</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Default</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(taxConfig.taxRates || []).map((rate, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{rate.name}</TableCell>
                                        <TableCell>{rate.rate}%</TableCell>
                                        <TableCell>{rate.category}</TableCell>
                                        <TableCell>{rate.isDefault ? <MdCheck className="text-green-500" /> : ""}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button variant="contained" startIcon={<FiSave />} onClick={saveTaxConfig} sx={{ mt: 3 }}>Save Tax Configuration</Button>
                </div>
            )}

            {/* --- TAB 5: API MANAGEMENT --- */}
            {tabValue === 5 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">API Keys</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => { setDialogType("api-key"); setOpenDialog(true); }}>Generate API Key</Button>
                    </div>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>API Key</TableCell>
                                    <TableCell>Rate Limit</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {apiKeys.map(key => (
                                    <TableRow key={key._id}>
                                        <TableCell>{key.apiName}</TableCell>
                                        <TableCell><code className="bg-gray-100 px-2 py-1 rounded text-xs">{key.apiKey?.substring(0, 20)}...</code></TableCell>
                                        <TableCell>{key.rateLimit}/hr</TableCell>
                                        <TableCell><Chip size="small" label={key.isActive ? "Active" : "Inactive"} color={key.isActive ? "success" : "default"} /></TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="error" onClick={() => deleteItem("api-key", key._id)}><MdDelete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {apiKeys.length === 0 && <div className="text-center py-8 text-gray-500">No API keys configured</div>}
                </div>
            )}

            {/* --- TAB 6: USER PERMISSIONS --- */}
            {tabValue === 6 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">User Roles & Permissions</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => { setDialogType("role"); setOpenDialog(true); }}>Add Role</Button>
                    </div>
                    <div className="space-y-4">
                        {roles.map(role => (
                            <Accordion key={role._id}>
                                <AccordionSummary expandIcon={<MdExpandMore />}>
                                    <div className="flex items-center gap-3">
                                        <Avatar sx={{ bgcolor: role.isSystemRole ? "#3b82f6" : "#10b981", width: 32, height: 32 }}><MdPeople size={16} /></Avatar>
                                        <span className="font-bold">{role.roleName}</span>
                                        {role.isSystemRole && <Chip size="small" label="System" color="primary" />}
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <p className="text-gray-600 mb-3">{role.description}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {Object.entries(role.permissions || {}).map(([key, perms]) => (
                                            <div key={key} className="bg-gray-50 p-2 rounded">
                                                <p className="font-medium capitalize text-sm">{key}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(perms || {}).filter(([k, v]) => v).map(([perm]) => (
                                                        <Chip key={perm} size="small" label={perm} color="success" sx={{ height: 20, fontSize: 10 }} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {!role.isSystemRole && (
                                        <Button size="small" color="error" startIcon={<MdDelete />} sx={{ mt: 2 }} onClick={() => deleteItem("role", role._id)}>Delete Role</Button>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 7: SECURITY SETTINGS --- */}
            {tabValue === 7 && (
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Security Settings</h3>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">Two-Factor Authentication</h4>
                            <FormControlLabel control={<Switch checked={securitySettings.twoFactorAuth?.enabled} onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: { ...securitySettings.twoFactorAuth, enabled: e.target.checked } })} />} label="Enable 2FA" />
                            <FormControlLabel control={<Switch checked={securitySettings.twoFactorAuth?.requiredForAdmin} onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: { ...securitySettings.twoFactorAuth, requiredForAdmin: e.target.checked } })} />} label="Required for Admin" />
                        </CardContent>
                    </Card>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">Password Policy</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <TextField label="Minimum Length" type="number" value={securitySettings.passwordPolicy?.minLength || 8} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, minLength: parseInt(e.target.value) } })} />
                            </div>
                            <div className="space-y-1 mt-3">
                                <FormControlLabel control={<Switch checked={securitySettings.passwordPolicy?.requireUppercase} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, requireUppercase: e.target.checked } })} />} label="Require Uppercase" />
                                <FormControlLabel control={<Switch checked={securitySettings.passwordPolicy?.requireNumbers} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, requireNumbers: e.target.checked } })} />} label="Require Numbers" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">Login Security</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <TextField label="Max Attempts" type="number" value={securitySettings.loginSecurity?.maxAttempts || 5} onChange={(e) => setSecuritySettings({ ...securitySettings, loginSecurity: { ...securitySettings.loginSecurity, maxAttempts: parseInt(e.target.value) } })} />
                                <TextField label="Lockout (min)" type="number" value={securitySettings.loginSecurity?.lockoutDuration || 30} onChange={(e) => setSecuritySettings({ ...securitySettings, loginSecurity: { ...securitySettings.loginSecurity, lockoutDuration: parseInt(e.target.value) } })} />
                                <TextField label="Session Timeout (min)" type="number" value={securitySettings.loginSecurity?.sessionTimeout || 60} onChange={(e) => setSecuritySettings({ ...securitySettings, loginSecurity: { ...securitySettings.loginSecurity, sessionTimeout: parseInt(e.target.value) } })} />
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="contained" startIcon={<FiSave />} onClick={saveSecuritySettings}>Save Security Settings</Button>
                </div>
            )}

            {/* --- TAB 8: GDPR COMPLIANCE --- */}
            {tabValue === 8 && (
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">GDPR Compliance</h3>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">Cookie Consent</h4>
                            <FormControlLabel control={<Switch checked={gdprSettings.cookieConsent?.enabled} onChange={(e) => setGdprSettings({ ...gdprSettings, cookieConsent: { ...gdprSettings.cookieConsent, enabled: e.target.checked } })} />} label="Enable Cookie Consent Banner" />
                            <TextField fullWidth label="Cookie Consent Message" multiline rows={2} value={gdprSettings.cookieConsent?.message || ""} onChange={(e) => setGdprSettings({ ...gdprSettings, cookieConsent: { ...gdprSettings.cookieConsent, message: e.target.value } })} sx={{ mt: 2 }} />
                        </CardContent>
                    </Card>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">Data Retention</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <TextField label="User Data (days)" type="number" value={gdprSettings.dataRetention?.userDataDays || 365} onChange={(e) => setGdprSettings({ ...gdprSettings, dataRetention: { ...gdprSettings.dataRetention, userDataDays: parseInt(e.target.value) } })} />
                                <TextField label="Order Data (days)" type="number" value={gdprSettings.dataRetention?.orderDataDays || 730} onChange={(e) => setGdprSettings({ ...gdprSettings, dataRetention: { ...gdprSettings.dataRetention, orderDataDays: parseInt(e.target.value) } })} />
                                <TextField label="Log Data (days)" type="number" value={gdprSettings.dataRetention?.logDataDays || 90} onChange={(e) => setGdprSettings({ ...gdprSettings, dataRetention: { ...gdprSettings.dataRetention, logDataDays: parseInt(e.target.value) } })} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">User Rights</h4>
                            <FormControlLabel control={<Switch checked={gdprSettings.dataExportEnabled} onChange={(e) => setGdprSettings({ ...gdprSettings, dataExportEnabled: e.target.checked })} />} label="Allow Data Export" />
                            <FormControlLabel control={<Switch checked={gdprSettings.dataDeletionEnabled} onChange={(e) => setGdprSettings({ ...gdprSettings, dataDeletionEnabled: e.target.checked })} />} label="Allow Account Deletion" />
                        </CardContent>
                    </Card>

                    <Button variant="contained" startIcon={<FiSave />} onClick={saveGdprSettings}>Save GDPR Settings</Button>
                </div>
            )}

            {/* --- TAB 9: DATA BACKUP --- */}
            {tabValue === 9 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Data Backup</h3>
                        <Button variant="contained" startIcon={<FiDatabase />} onClick={createBackup}>Create Backup Now</Button>
                    </div>

                    <Card className="mb-6">
                        <CardContent>
                            <h4 className="font-bold mb-3">Automatic Backup Settings</h4>
                            <FormControlLabel control={<Switch checked={backupSettings.autoBackupEnabled} onChange={(e) => setBackupSettings({ ...backupSettings, autoBackupEnabled: e.target.checked })} />} label="Enable Auto Backup" />
                            <div className="grid grid-cols-3 gap-4 mt-3">
                                <FormControl fullWidth>
                                    <InputLabel>Frequency</InputLabel>
                                    <Select value={backupSettings.frequency} onChange={(e) => setBackupSettings({ ...backupSettings, frequency: e.target.value })}>
                                        <MenuItem value="daily">Daily</MenuItem>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField label="Time" type="time" value={backupSettings.time} onChange={(e) => setBackupSettings({ ...backupSettings, time: e.target.value })} />
                                <TextField label="Keep Last" type="number" value={backupSettings.retentionCount} onChange={(e) => setBackupSettings({ ...backupSettings, retentionCount: parseInt(e.target.value) })} />
                            </div>
                            <Button variant="outlined" startIcon={<FiSave />} onClick={saveBackupSettings} sx={{ mt: 2 }}>Save Settings</Button>
                        </CardContent>
                    </Card>

                    <h4 className="font-bold mb-3">Recent Backups</h4>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell>Backup Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {backups.map(backup => (
                                    <TableRow key={backup._id}>
                                        <TableCell>{backup.backupName}</TableCell>
                                        <TableCell><Chip size="small" label={backup.backupType} /></TableCell>
                                        <TableCell>{formatBytes(backup.size)}</TableCell>
                                        <TableCell><Chip size="small" label={backup.status} color={backup.status === "completed" ? "success" : backup.status === "running" ? "warning" : "error"} /></TableCell>
                                        <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary"><FiDownload /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => deleteItem("backup", backup._id)}><MdDelete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}

            {/* --- TAB 10: PERSONALIZATION --- */}
            {tabValue === 10 && (
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Personalization Tools</h3>
                    <Card>
                        <CardContent>
                            <div className="space-y-3">
                                <FormControlLabel control={<Switch checked={personalization.enableRecommendations} onChange={(e) => setPersonalization({ ...personalization, enableRecommendations: e.target.checked })} />} label="Enable Product Recommendations" />
                                <FormControlLabel control={<Switch checked={personalization.enableRecentlyViewed} onChange={(e) => setPersonalization({ ...personalization, enableRecentlyViewed: e.target.checked })} />} label="Show Recently Viewed Products" />
                                <FormControlLabel control={<Switch checked={personalization.enableAbandonedCartReminders} onChange={(e) => setPersonalization({ ...personalization, enableAbandonedCartReminders: e.target.checked })} />} label="Send Abandoned Cart Reminders" />
                                <FormControlLabel control={<Switch checked={personalization.enableBirthdayOffers} onChange={(e) => setPersonalization({ ...personalization, enableBirthdayOffers: e.target.checked })} />} label="Send Birthday Offers" />
                            </div>
                        </CardContent>
                    </Card>
                    <Button variant="contained" startIcon={<FiSave />} onClick={savePersonalization} sx={{ mt: 3 }}>Save Personalization Settings</Button>
                </div>
            )}

            {/* --- TAB 11: MESSAGE TEMPLATES --- */}
            {tabValue === 11 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Message Templates</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => { setDialogType("template"); setOpenDialog(true); }}>Add Template</Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {messageTemplates.map(template => (
                            <Card key={template._id}>
                                <CardContent>
                                    <div className="flex justify-between items-start mb-2">
                                        <Chip size="small" label={template.type} color={template.type === "email" ? "primary" : template.type === "sms" ? "success" : "warning"} />
                                        <IconButton size="small" color="error" onClick={() => deleteItem("message-template", template._id)}><MdDelete /></IconButton>
                                    </div>
                                    <h4 className="font-bold">{template.name}</h4>
                                    {template.subject && <p className="text-sm text-gray-500">Subject: {template.subject}</p>}
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{template.body}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {messageTemplates.length === 0 && <div className="text-center py-8 text-gray-500">No templates configured</div>}
                </div>
            )}

            {/* --- TAB 12: CUSTOMIZATION --- */}
            {tabValue === 12 && (
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Customization Settings</h3>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">Theme Colors</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Primary Color</label>
                                    <input type="color" value={customization.theme?.primaryColor || "#3B82F6"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, primaryColor: e.target.value } })} className="w-full h-10 rounded cursor-pointer" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Secondary Color</label>
                                    <input type="color" value={customization.theme?.secondaryColor || "#10B981"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, secondaryColor: e.target.value } })} className="w-full h-10 rounded cursor-pointer" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-4">
                        <CardContent>
                            <h4 className="font-bold mb-3">Checkout Options</h4>
                            <div className="space-y-2">
                                <FormControlLabel control={<Switch checked={customization.checkout?.guestCheckout} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, guestCheckout: e.target.checked } })} />} label="Allow Guest Checkout" />
                                <FormControlLabel control={<Switch checked={customization.checkout?.showCouponField} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, showCouponField: e.target.checked } })} />} label="Show Coupon Field" />
                                <FormControlLabel control={<Switch checked={customization.checkout?.showGiftWrap} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, showGiftWrap: e.target.checked } })} />} label="Show Gift Wrap Option" />
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="contained" startIcon={<FiSave />} onClick={saveCustomization}>Save Customization</Button>
                </div>
            )}

            {/* --- TAB 13: GREETING CARDS --- */}
            {tabValue === 13 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Greeting Cards</h3>
                        <Button variant="contained" startIcon={<FiPlus />} onClick={() => { setDialogType("greeting-card"); setOpenDialog(true); }}>Add Card</Button>
                    </div>
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {greetingCards.map(card => (
                            <Card key={card._id}>
                                <CardContent className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                        <MdCardGiftcard size={32} className="text-white" />
                                    </div>
                                    <h4 className="font-bold">{card.title}</h4>
                                    <Chip size="small" label={card.category} sx={{ mt: 1 }} />
                                    <div className="flex justify-center gap-1 mt-3">
                                        <IconButton size="small" color="error" onClick={() => deleteItem("greeting-card", card._id)}><MdDelete /></IconButton>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {greetingCards.length === 0 && <div className="text-center py-8 text-gray-500">No greeting cards configured</div>}
                </div>
            )}

            {/* --- DIALOGS --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogType === "api-key" && "Generate API Key"}
                    {dialogType === "role" && "Create New Role"}
                    {dialogType === "template" && "Create Message Template"}
                    {dialogType === "greeting-card" && "Add Greeting Card"}
                </DialogTitle>
                <DialogContent>
                    {dialogType === "api-key" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="API Name" value={newApiKey.apiName} onChange={(e) => setNewApiKey({ ...newApiKey, apiName: e.target.value })} />
                            <TextField fullWidth label="Rate Limit (per hour)" type="number" value={newApiKey.rateLimit} onChange={(e) => setNewApiKey({ ...newApiKey, rateLimit: parseInt(e.target.value) })} />
                        </div>
                    )}
                    {dialogType === "role" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Role Name" value={newRole.roleName} onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })} />
                            <TextField fullWidth label="Description" multiline rows={2} value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
                        </div>
                    )}
                    {dialogType === "template" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Template Name" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={newTemplate.type} onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}>
                                    <MenuItem value="email">Email</MenuItem>
                                    <MenuItem value="sms">SMS</MenuItem>
                                    <MenuItem value="push">Push</MenuItem>
                                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                                </Select>
                            </FormControl>
                            {newTemplate.type === "email" && <TextField fullWidth label="Subject" value={newTemplate.subject} onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })} />}
                            <TextField fullWidth label="Body" multiline rows={4} value={newTemplate.body} onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })} />
                        </div>
                    )}
                    {dialogType === "greeting-card" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Card Title" value={newCard.title} onChange={(e) => setNewCard({ ...newCard, title: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select value={newCard.category} onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}>
                                    <MenuItem value="birthday">Birthday</MenuItem>
                                    <MenuItem value="anniversary">Anniversary</MenuItem>
                                    <MenuItem value="wedding">Wedding</MenuItem>
                                    <MenuItem value="festive">Festive</MenuItem>
                                    <MenuItem value="thank_you">Thank You</MenuItem>
                                    <MenuItem value="congratulations">Congratulations</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="Template Text" multiline rows={3} value={newCard.template} onChange={(e) => setNewCard({ ...newCard, template: e.target.value })} />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        if (dialogType === "api-key") createApiKey();
                        else if (dialogType === "role") createRole();
                        else if (dialogType === "template") createMessageTemplate();
                        else if (dialogType === "greeting-card") createGreetingCard();
                    }}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Settings;
