import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel, LinearProgress, Alert } from "@mui/material";
import { MdWebAsset, MdSave } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function SiteConfiguration() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [siteConfig, setSiteConfig] = useState({
        siteName: "", siteUrl: "", logo: "", favicon: "", tagline: "", description: "",
        contactEmail: "", contactPhone: "", address: "",
        socialLinks: { facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "" },
        currency: "INR", currencySymbol: "₹", timezone: "Asia/Kolkata", language: "en",
        maintenanceMode: false, maintenanceMessage: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/site-config`, { headers: { token: atoken } });
            if (data.success && data.config) {
                setSiteConfig(prev => ({ ...prev, ...data.config }));
            }
        } catch (e) {
            console.error("Error fetching site config:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/site-config`, siteConfig, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Site configuration saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save site configuration");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><MdWebAsset size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Site Configuration</h2>
                        <p className="text-sm text-gray-500">Configure your site's basic settings and branding.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-4xl">
                {/* Basic Info */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Basic Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <TextField fullWidth label="Site Name" value={siteConfig.siteName} onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })} />
                            <TextField fullWidth label="Site URL" value={siteConfig.siteUrl} onChange={(e) => setSiteConfig({ ...siteConfig, siteUrl: e.target.value })} />
                            <TextField fullWidth label="Tagline" value={siteConfig.tagline} onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })} />
                            <TextField fullWidth label="Logo URL" value={siteConfig.logo} onChange={(e) => setSiteConfig({ ...siteConfig, logo: e.target.value })} />
                        </div>
                        <TextField fullWidth label="Description" multiline rows={3} value={siteConfig.description} onChange={(e) => setSiteConfig({ ...siteConfig, description: e.target.value })} sx={{ mt: 2 }} />
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <TextField fullWidth label="Contact Email" value={siteConfig.contactEmail} onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })} />
                            <TextField fullWidth label="Contact Phone" value={siteConfig.contactPhone} onChange={(e) => setSiteConfig({ ...siteConfig, contactPhone: e.target.value })} />
                        </div>
                        <TextField fullWidth label="Address" multiline rows={2} value={siteConfig.address} onChange={(e) => setSiteConfig({ ...siteConfig, address: e.target.value })} sx={{ mt: 2 }} />
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Regional Settings</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormControl fullWidth>
                                <InputLabel>Currency</InputLabel>
                                <Select value={siteConfig.currency} onChange={(e) => setSiteConfig({ ...siteConfig, currency: e.target.value })}>
                                    <MenuItem value="INR">INR (₹)</MenuItem>
                                    <MenuItem value="USD">USD ($)</MenuItem>
                                    <MenuItem value="EUR">EUR (€)</MenuItem>
                                    <MenuItem value="GBP">GBP (£)</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Timezone</InputLabel>
                                <Select value={siteConfig.timezone} onChange={(e) => setSiteConfig({ ...siteConfig, timezone: e.target.value })}>
                                    <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                                    <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                                    <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                                    <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Language</InputLabel>
                                <Select value={siteConfig.language} onChange={(e) => setSiteConfig({ ...siteConfig, language: e.target.value })}>
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="hi">Hindi</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Social Links</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <TextField label="Facebook" value={siteConfig.socialLinks?.facebook || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, facebook: e.target.value } })} />
                            <TextField label="Instagram" value={siteConfig.socialLinks?.instagram || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, instagram: e.target.value } })} />
                            <TextField label="Twitter" value={siteConfig.socialLinks?.twitter || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, twitter: e.target.value } })} />
                            <TextField label="YouTube" value={siteConfig.socialLinks?.youtube || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, youtube: e.target.value } })} />
                            <TextField label="LinkedIn" value={siteConfig.socialLinks?.linkedin || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, linkedin: e.target.value } })} />
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Mode */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Maintenance Mode</h3>
                        <FormControlLabel
                            control={<Switch checked={siteConfig.maintenanceMode} onChange={(e) => setSiteConfig({ ...siteConfig, maintenanceMode: e.target.checked })} color="warning" />}
                            label="Enable Maintenance Mode"
                        />
                        {siteConfig.maintenanceMode && (
                            <TextField fullWidth label="Maintenance Message" multiline rows={2} value={siteConfig.maintenanceMessage} onChange={(e) => setSiteConfig({ ...siteConfig, maintenanceMessage: e.target.value })} sx={{ mt: 2 }} />
                        )}
                    </CardContent>
                </Card>

                <Button variant="contained" size="large" startIcon={<FiSave />} onClick={saveConfig} disabled={saving}>
                    {saving ? "Saving..." : "Save Configuration"}
                </Button>
            </div>
        </div>
    );
}

export default SiteConfiguration;
