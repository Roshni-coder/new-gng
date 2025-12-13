import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel, LinearProgress, Alert } from "@mui/material";
import { MdSms } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function SmsSettings() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [smsSettings, setSmsSettings] = useState({
        provider: "twilio", isActive: false,
        credentials: { accountSid: "", authToken: "", senderId: "", apiKey: "" },
        templates: { otp: "", orderConfirmation: "", orderShipped: "", orderDelivered: "" },
        dailyLimit: 1000
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/sms-settings`, { headers: { token: atoken } });
            if (data.success && data.settings) {
                setSmsSettings(prev => ({ ...prev, ...data.settings }));
            }
        } catch (e) {
            console.error("Error fetching SMS settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/sms-settings`, smsSettings, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("SMS settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save SMS settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><MdSms size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">SMS Settings</h2>
                        <p className="text-sm text-gray-500">Configure SMS gateway for notifications and OTP.</p>
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
                            <h3 className="text-lg font-bold">SMS Configuration</h3>
                            <FormControlLabel
                                control={<Switch checked={smsSettings.isActive} onChange={(e) => setSmsSettings({ ...smsSettings, isActive: e.target.checked })} color="success" />}
                                label={smsSettings.isActive ? "Active" : "Inactive"}
                            />
                        </div>
                        <FormControl fullWidth>
                            <InputLabel>SMS Provider</InputLabel>
                            <Select value={smsSettings.provider} onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}>
                                <MenuItem value="twilio">Twilio</MenuItem>
                                <MenuItem value="msg91">MSG91</MenuItem>
                                <MenuItem value="textlocal">TextLocal</MenuItem>
                                <MenuItem value="aws_sns">AWS SNS</MenuItem>
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Credentials */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">API Credentials</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <TextField fullWidth label="Account SID / API Key" value={smsSettings.credentials?.accountSid || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, accountSid: e.target.value } })} />
                            <TextField fullWidth label="Auth Token / API Secret" type="password" value={smsSettings.credentials?.authToken || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, authToken: e.target.value } })} />
                            <TextField fullWidth label="Sender ID" placeholder="GNGIFT" value={smsSettings.credentials?.senderId || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, senderId: e.target.value } })} />
                            <TextField fullWidth label="Daily Limit" type="number" value={smsSettings.dailyLimit} onChange={(e) => setSmsSettings({ ...smsSettings, dailyLimit: parseInt(e.target.value) })} />
                        </div>
                    </CardContent>
                </Card>

                {/* SMS Templates */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">SMS Templates</h3>
                        <p className="text-sm text-gray-500 mb-4">Use variables like {'{otp}'}, {'{orderId}'}, {'{trackingUrl}'} in your templates</p>
                        <div className="space-y-4">
                            <TextField fullWidth label="OTP Message" placeholder="Your OTP is {{otp}}. Valid for 10 minutes." value={smsSettings.templates?.otp || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, otp: e.target.value } })} />
                            <TextField fullWidth label="Order Confirmation" placeholder="Your order #{{orderId}} is confirmed!" value={smsSettings.templates?.orderConfirmation || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, orderConfirmation: e.target.value } })} />
                            <TextField fullWidth label="Order Shipped" placeholder="Your order #{{orderId}} has been shipped. Track: {{trackingUrl}}" value={smsSettings.templates?.orderShipped || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, orderShipped: e.target.value } })} />
                            <TextField fullWidth label="Order Delivered" placeholder="Your order #{{orderId}} has been delivered!" value={smsSettings.templates?.orderDelivered || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, orderDelivered: e.target.value } })} />
                        </div>
                    </CardContent>
                </Card>

                <Button variant="contained" size="large" startIcon={<FiSave />} onClick={saveSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}

export default SmsSettings;
