import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Switch, FormControlLabel, LinearProgress, Alert } from "@mui/material";
import { MdPolicy, MdCookie, MdStorage, MdPerson } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function GdprCompliance() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [gdprSettings, setGdprSettings] = useState({
        cookieConsent: {
            enabled: true, message: "We use cookies to enhance your experience.",
            acceptButtonText: "Accept", declineButtonText: "Decline", policyLink: ""
        },
        dataRetention: {
            userDataDays: 365, orderDataDays: 730, logDataDays: 90
        },
        privacyPolicy: { content: "", lastUpdated: null, version: "1.0" },
        termsOfService: { content: "", lastUpdated: null, version: "1.0" },
        dataExportEnabled: true,
        dataDeletionEnabled: true,
        consentLogging: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/gdpr`, { headers: { token: atoken } });
            if (data.success && data.settings) {
                setGdprSettings(prev => ({ ...prev, ...data.settings }));
            }
        } catch (e) {
            console.error("Error fetching GDPR settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/gdpr`, gdprSettings, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("GDPR settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save GDPR settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><MdPolicy size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">GDPR Compliance</h2>
                        <p className="text-sm text-gray-500">Configure privacy settings and data handling policies.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-4xl">
                {/* Cookie Consent */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdCookie size={24} className="text-amber-500" />
                            <h3 className="text-lg font-bold">Cookie Consent Banner</h3>
                        </div>
                        <FormControlLabel
                            control={<Switch checked={gdprSettings.cookieConsent?.enabled} onChange={(e) => setGdprSettings({ ...gdprSettings, cookieConsent: { ...gdprSettings.cookieConsent, enabled: e.target.checked } })} />}
                            label="Enable Cookie Consent Banner"
                        />
                        {gdprSettings.cookieConsent?.enabled && (
                            <div className="mt-4 space-y-4">
                                <TextField fullWidth label="Consent Message" multiline rows={2} value={gdprSettings.cookieConsent?.message || ""} onChange={(e) => setGdprSettings({ ...gdprSettings, cookieConsent: { ...gdprSettings.cookieConsent, message: e.target.value } })} />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <TextField label="Accept Button Text" value={gdprSettings.cookieConsent?.acceptButtonText || ""} onChange={(e) => setGdprSettings({ ...gdprSettings, cookieConsent: { ...gdprSettings.cookieConsent, acceptButtonText: e.target.value } })} />
                                    <TextField label="Decline Button Text" value={gdprSettings.cookieConsent?.declineButtonText || ""} onChange={(e) => setGdprSettings({ ...gdprSettings, cookieConsent: { ...gdprSettings.cookieConsent, declineButtonText: e.target.value } })} />
                                </div>
                                <TextField fullWidth label="Privacy Policy URL" placeholder="https://yoursite.com/privacy" value={gdprSettings.cookieConsent?.policyLink || ""} onChange={(e) => setGdprSettings({ ...gdprSettings, cookieConsent: { ...gdprSettings.cookieConsent, policyLink: e.target.value } })} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Data Retention */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdStorage size={24} className="text-purple-500" />
                            <h3 className="text-lg font-bold">Data Retention Policy</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Configure how long different types of data are retained. Data older than these periods may be automatically deleted.</p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <TextField label="User Data Retention (days)" type="number" value={gdprSettings.dataRetention?.userDataDays || 365} onChange={(e) => setGdprSettings({ ...gdprSettings, dataRetention: { ...gdprSettings.dataRetention, userDataDays: parseInt(e.target.value) } })} helperText="Profile, preferences" />
                            <TextField label="Order Data Retention (days)" type="number" value={gdprSettings.dataRetention?.orderDataDays || 730} onChange={(e) => setGdprSettings({ ...gdprSettings, dataRetention: { ...gdprSettings.dataRetention, orderDataDays: parseInt(e.target.value) } })} helperText="Order history, invoices" />
                            <TextField label="Log Data Retention (days)" type="number" value={gdprSettings.dataRetention?.logDataDays || 90} onChange={(e) => setGdprSettings({ ...gdprSettings, dataRetention: { ...gdprSettings.dataRetention, logDataDays: parseInt(e.target.value) } })} helperText="Activity logs, analytics" />
                        </div>
                    </CardContent>
                </Card>

                {/* User Rights */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdPerson size={24} className="text-green-500" />
                            <h3 className="text-lg font-bold">User Rights</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Enable/disable user rights under GDPR and similar regulations.</p>
                        <div className="space-y-3">
                            <FormControlLabel
                                control={<Switch checked={gdprSettings.dataExportEnabled} onChange={(e) => setGdprSettings({ ...gdprSettings, dataExportEnabled: e.target.checked })} />}
                                label="Right to Data Portability (Allow users to export their data)"
                            />
                            <FormControlLabel
                                control={<Switch checked={gdprSettings.dataDeletionEnabled} onChange={(e) => setGdprSettings({ ...gdprSettings, dataDeletionEnabled: e.target.checked })} />}
                                label="Right to Erasure (Allow users to request account deletion)"
                            />
                            <FormControlLabel
                                control={<Switch checked={gdprSettings.consentLogging} onChange={(e) => setGdprSettings({ ...gdprSettings, consentLogging: e.target.checked })} />}
                                label="Consent Logging (Track when users give consent)"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Policy */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Privacy Policy</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <TextField label="Version" value={gdprSettings.privacyPolicy?.version || "1.0"} onChange={(e) => setGdprSettings({ ...gdprSettings, privacyPolicy: { ...gdprSettings.privacyPolicy, version: e.target.value } })} />
                            <TextField label="Last Updated" type="date" InputLabelProps={{ shrink: true }} value={gdprSettings.privacyPolicy?.lastUpdated ? new Date(gdprSettings.privacyPolicy.lastUpdated).toISOString().split('T')[0] : ""} onChange={(e) => setGdprSettings({ ...gdprSettings, privacyPolicy: { ...gdprSettings.privacyPolicy, lastUpdated: e.target.value } })} />
                        </div>
                        <TextField fullWidth label="Privacy Policy Content" multiline rows={6} placeholder="Enter your privacy policy content here..." value={gdprSettings.privacyPolicy?.content || ""} onChange={(e) => setGdprSettings({ ...gdprSettings, privacyPolicy: { ...gdprSettings.privacyPolicy, content: e.target.value } })} />
                    </CardContent>
                </Card>

                {/* Terms of Service */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Terms of Service</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <TextField label="Version" value={gdprSettings.termsOfService?.version || "1.0"} onChange={(e) => setGdprSettings({ ...gdprSettings, termsOfService: { ...gdprSettings.termsOfService, version: e.target.value } })} />
                            <TextField label="Last Updated" type="date" InputLabelProps={{ shrink: true }} value={gdprSettings.termsOfService?.lastUpdated ? new Date(gdprSettings.termsOfService.lastUpdated).toISOString().split('T')[0] : ""} onChange={(e) => setGdprSettings({ ...gdprSettings, termsOfService: { ...gdprSettings.termsOfService, lastUpdated: e.target.value } })} />
                        </div>
                        <TextField fullWidth label="Terms of Service Content" multiline rows={6} placeholder="Enter your terms of service content here..." value={gdprSettings.termsOfService?.content || ""} onChange={(e) => setGdprSettings({ ...gdprSettings, termsOfService: { ...gdprSettings.termsOfService, content: e.target.value } })} />
                    </CardContent>
                </Card>

                <Button variant="contained" size="large" startIcon={<FiSave />} onClick={saveSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save GDPR Settings"}
                </Button>
            </div>
        </div>
    );
}

export default GdprCompliance;
