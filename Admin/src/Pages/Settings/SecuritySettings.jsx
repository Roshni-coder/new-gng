import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Switch, FormControlLabel, LinearProgress, Alert, Select, MenuItem, FormControl, InputLabel, Chip } from "@mui/material";
import { MdSecurity, MdLock, MdTimer, MdBlock } from "react-icons/md";
import { FiRefreshCw, FiSave, FiShield } from "react-icons/fi";

function SecuritySettings() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: {
            enabled: false, requiredForAdmin: true,
            methods: ['email']
        },
        passwordPolicy: {
            minLength: 8, requireUppercase: true, requireLowercase: true,
            requireNumbers: true, requireSpecialChars: false,
            expiryDays: 90, preventReuse: 5
        },
        loginSecurity: {
            maxAttempts: 5, lockoutDuration: 30, sessionTimeout: 60, singleSession: false
        },
        ipWhitelist: [],
        ipBlacklist: [],
        captchaEnabled: false,
        captchaProvider: 'recaptcha',
        captchaSiteKey: '',
        captchaSecretKey: ''
    });

    const [newIp, setNewIp] = useState({ whitelist: '', blacklist: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/security`, { headers: { token: atoken } });
            if (data.success && data.settings) {
                setSecuritySettings(prev => ({ ...prev, ...data.settings }));
            }
        } catch (e) {
            console.error("Error fetching security settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/security`, securitySettings, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Security settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save security settings");
        } finally {
            setSaving(false);
        }
    };

    const addToList = (type) => {
        const ip = newIp[type].trim();
        if (!ip) return;
        const listKey = type === 'whitelist' ? 'ipWhitelist' : 'ipBlacklist';
        if (!securitySettings[listKey].includes(ip)) {
            setSecuritySettings({
                ...securitySettings,
                [listKey]: [...securitySettings[listKey], ip]
            });
        }
        setNewIp({ ...newIp, [type]: '' });
    };

    const removeFromList = (type, ip) => {
        const listKey = type === 'whitelist' ? 'ipWhitelist' : 'ipBlacklist';
        setSecuritySettings({
            ...securitySettings,
            [listKey]: securitySettings[listKey].filter(i => i !== ip)
        });
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg"><MdSecurity size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
                        <p className="text-sm text-gray-500">Configure authentication and security policies.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-4xl">
                {/* Two-Factor Authentication */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <FiShield size={24} className="text-blue-500" />
                            <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
                        </div>
                        <div className="space-y-3">
                            <FormControlLabel
                                control={<Switch checked={securitySettings.twoFactorAuth?.enabled} onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: { ...securitySettings.twoFactorAuth, enabled: e.target.checked } })} />}
                                label="Enable Two-Factor Authentication"
                            />
                            <FormControlLabel
                                control={<Switch checked={securitySettings.twoFactorAuth?.requiredForAdmin} onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: { ...securitySettings.twoFactorAuth, requiredForAdmin: e.target.checked } })} />}
                                label="Required for Admin Accounts"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Password Policy */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdLock size={24} className="text-purple-500" />
                            <h3 className="text-lg font-bold">Password Policy</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <TextField label="Minimum Length" type="number" value={securitySettings.passwordPolicy?.minLength || 8} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, minLength: parseInt(e.target.value) } })} />
                            <TextField label="Password Expiry (days)" type="number" value={securitySettings.passwordPolicy?.expiryDays || 90} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, expiryDays: parseInt(e.target.value) } })} />
                            <TextField label="Prevent Reuse (count)" type="number" value={securitySettings.passwordPolicy?.preventReuse || 5} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, preventReuse: parseInt(e.target.value) } })} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <FormControlLabel control={<Switch size="small" checked={securitySettings.passwordPolicy?.requireUppercase} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, requireUppercase: e.target.checked } })} />} label="Uppercase" />
                            <FormControlLabel control={<Switch size="small" checked={securitySettings.passwordPolicy?.requireLowercase} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, requireLowercase: e.target.checked } })} />} label="Lowercase" />
                            <FormControlLabel control={<Switch size="small" checked={securitySettings.passwordPolicy?.requireNumbers} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, requireNumbers: e.target.checked } })} />} label="Numbers" />
                            <FormControlLabel control={<Switch size="small" checked={securitySettings.passwordPolicy?.requireSpecialChars} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: { ...securitySettings.passwordPolicy, requireSpecialChars: e.target.checked } })} />} label="Special Chars" />
                        </div>
                    </CardContent>
                </Card>

                {/* Login Security */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdTimer size={24} className="text-orange-500" />
                            <h3 className="text-lg font-bold">Login Security</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <TextField label="Max Login Attempts" type="number" value={securitySettings.loginSecurity?.maxAttempts || 5} onChange={(e) => setSecuritySettings({ ...securitySettings, loginSecurity: { ...securitySettings.loginSecurity, maxAttempts: parseInt(e.target.value) } })} />
                            <TextField label="Lockout Duration (min)" type="number" value={securitySettings.loginSecurity?.lockoutDuration || 30} onChange={(e) => setSecuritySettings({ ...securitySettings, loginSecurity: { ...securitySettings.loginSecurity, lockoutDuration: parseInt(e.target.value) } })} />
                            <TextField label="Session Timeout (min)" type="number" value={securitySettings.loginSecurity?.sessionTimeout || 60} onChange={(e) => setSecuritySettings({ ...securitySettings, loginSecurity: { ...securitySettings.loginSecurity, sessionTimeout: parseInt(e.target.value) } })} />
                        </div>
                        <FormControlLabel
                            control={<Switch checked={securitySettings.loginSecurity?.singleSession} onChange={(e) => setSecuritySettings({ ...securitySettings, loginSecurity: { ...securitySettings.loginSecurity, singleSession: e.target.checked } })} />}
                            label="Allow Only Single Active Session"
                        />
                    </CardContent>
                </Card>

                {/* IP Whitelist/Blacklist */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdBlock size={24} className="text-gray-500" />
                            <h3 className="text-lg font-bold">IP Access Control</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Whitelist */}
                            <div>
                                <h4 className="font-medium mb-2">IP Whitelist</h4>
                                <div className="flex gap-2 mb-2">
                                    <TextField size="small" placeholder="Enter IP address" value={newIp.whitelist} onChange={(e) => setNewIp({ ...newIp, whitelist: e.target.value })} className="flex-1" />
                                    <Button size="small" onClick={() => addToList('whitelist')}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {(securitySettings.ipWhitelist || []).map(ip => (
                                        <Chip key={ip} label={ip} size="small" onDelete={() => removeFromList('whitelist', ip)} color="success" variant="outlined" />
                                    ))}
                                </div>
                            </div>
                            {/* Blacklist */}
                            <div>
                                <h4 className="font-medium mb-2">IP Blacklist</h4>
                                <div className="flex gap-2 mb-2">
                                    <TextField size="small" placeholder="Enter IP address" value={newIp.blacklist} onChange={(e) => setNewIp({ ...newIp, blacklist: e.target.value })} className="flex-1" />
                                    <Button size="small" onClick={() => addToList('blacklist')}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {(securitySettings.ipBlacklist || []).map(ip => (
                                        <Chip key={ip} label={ip} size="small" onDelete={() => removeFromList('blacklist', ip)} color="error" variant="outlined" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CAPTCHA */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">CAPTCHA Protection</h3>
                        <FormControlLabel
                            control={<Switch checked={securitySettings.captchaEnabled} onChange={(e) => setSecuritySettings({ ...securitySettings, captchaEnabled: e.target.checked })} />}
                            label="Enable CAPTCHA"
                        />
                        {securitySettings.captchaEnabled && (
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <FormControl fullWidth>
                                    <InputLabel>Provider</InputLabel>
                                    <Select value={securitySettings.captchaProvider || 'recaptcha'} onChange={(e) => setSecuritySettings({ ...securitySettings, captchaProvider: e.target.value })}>
                                        <MenuItem value="recaptcha">Google reCAPTCHA</MenuItem>
                                        <MenuItem value="hcaptcha">hCaptcha</MenuItem>
                                    </Select>
                                </FormControl>
                                <div></div>
                                <TextField label="Site Key" value={securitySettings.captchaSiteKey} onChange={(e) => setSecuritySettings({ ...securitySettings, captchaSiteKey: e.target.value })} />
                                <TextField label="Secret Key" type="password" value={securitySettings.captchaSecretKey} onChange={(e) => setSecuritySettings({ ...securitySettings, captchaSecretKey: e.target.value })} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button variant="contained" size="large" startIcon={<FiSave />} onClick={saveSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save Security Settings"}
                </Button>
            </div>
        </div>
    );
}

export default SecuritySettings;
