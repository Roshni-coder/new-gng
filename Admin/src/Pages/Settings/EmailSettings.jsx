import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel, LinearProgress, Alert } from "@mui/material";
import { MdEmail, MdSend } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function EmailSettings() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [success, setSuccess] = useState("");

    const [emailSettings, setEmailSettings] = useState({
        provider: "smtp", isActive: false,
        smtp: { host: "", port: 587, secure: false, username: "", password: "" },
        apiKey: "", fromEmail: "", fromName: "", replyTo: "",
        bccAdmin: false, bccEmail: "", dailyLimit: 500
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/email-settings`, { headers: { token: atoken } });
            if (data.success && data.settings) {
                setEmailSettings(prev => ({ ...prev, ...data.settings }));
            }
        } catch (e) {
            console.error("Error fetching email settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/email-settings`, emailSettings, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Email settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save email settings");
        } finally {
            setSaving(false);
        }
    };

    const testEmail = async () => {
        setTesting(true);
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/email-settings/test`, {}, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Test email sent successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to send test email");
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MdEmail size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Email Settings</h2>
                        <p className="text-sm text-gray-500">Configure email delivery for notifications and marketing.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-3xl">
                {/* Enable/Provider */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Email Configuration</h3>
                            <FormControlLabel
                                control={<Switch checked={emailSettings.isActive} onChange={(e) => setEmailSettings({ ...emailSettings, isActive: e.target.checked })} color="success" />}
                                label={emailSettings.isActive ? "Active" : "Inactive"}
                            />
                        </div>
                        <FormControl fullWidth>
                            <InputLabel>Email Provider</InputLabel>
                            <Select value={emailSettings.provider} onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}>
                                <MenuItem value="smtp">SMTP Server</MenuItem>
                                <MenuItem value="sendgrid">SendGrid</MenuItem>
                                <MenuItem value="mailgun">Mailgun</MenuItem>
                                <MenuItem value="ses">Amazon SES</MenuItem>
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* SMTP Settings */}
                {emailSettings.provider === 'smtp' && (
                    <Card className="mb-6">
                        <CardContent>
                            <h3 className="text-lg font-bold mb-4">SMTP Configuration</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <TextField fullWidth label="SMTP Host" placeholder="smtp.gmail.com" value={emailSettings.smtp?.host || ""} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, host: e.target.value } })} />
                                <TextField fullWidth label="Port" type="number" value={emailSettings.smtp?.port || 587} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, port: parseInt(e.target.value) } })} />
                                <TextField fullWidth label="Username" value={emailSettings.smtp?.username || ""} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, username: e.target.value } })} />
                                <TextField fullWidth label="Password" type="password" value={emailSettings.smtp?.password || ""} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, password: e.target.value } })} />
                            </div>
                            <FormControlLabel
                                control={<Switch checked={emailSettings.smtp?.secure || false} onChange={(e) => setEmailSettings({ ...emailSettings, smtp: { ...emailSettings.smtp, secure: e.target.checked } })} />}
                                label="Use SSL/TLS"
                                sx={{ mt: 2 }}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* API Key for other providers */}
                {emailSettings.provider !== 'smtp' && (
                    <Card className="mb-6">
                        <CardContent>
                            <h3 className="text-lg font-bold mb-4">{emailSettings.provider.toUpperCase()} Configuration</h3>
                            <TextField fullWidth label="API Key" type="password" value={emailSettings.apiKey || ""} onChange={(e) => setEmailSettings({ ...emailSettings, apiKey: e.target.value })} />
                        </CardContent>
                    </Card>
                )}

                {/* Sender Settings */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Sender Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <TextField fullWidth label="From Email" placeholder="noreply@yourdomain.com" value={emailSettings.fromEmail} onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })} />
                            <TextField fullWidth label="From Name" placeholder="Gift N Gifts" value={emailSettings.fromName} onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })} />
                            <TextField fullWidth label="Reply-To Email" value={emailSettings.replyTo} onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })} />
                            <TextField fullWidth label="Daily Limit" type="number" value={emailSettings.dailyLimit} onChange={(e) => setEmailSettings({ ...emailSettings, dailyLimit: parseInt(e.target.value) })} />
                        </div>
                    </CardContent>
                </Card>

                {/* BCC Settings */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Admin Copy</h3>
                        <FormControlLabel
                            control={<Switch checked={emailSettings.bccAdmin} onChange={(e) => setEmailSettings({ ...emailSettings, bccAdmin: e.target.checked })} />}
                            label="Send BCC copy to admin"
                        />
                        {emailSettings.bccAdmin && (
                            <TextField fullWidth label="Admin Email for BCC" value={emailSettings.bccEmail} onChange={(e) => setEmailSettings({ ...emailSettings, bccEmail: e.target.value })} sx={{ mt: 2 }} />
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button variant="contained" size="large" startIcon={<FiSave />} onClick={saveSettings} disabled={saving}>
                        {saving ? "Saving..." : "Save Settings"}
                    </Button>
                    <Button variant="outlined" size="large" startIcon={<MdSend />} onClick={testEmail} disabled={testing || !emailSettings.isActive}>
                        {testing ? "Sending..." : "Send Test Email"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EmailSettings;
