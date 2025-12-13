import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Tab, Tabs, Box, Button, TextField, Switch, FormControlLabel, Card, CardContent, Divider, Alert } from '@mui/material';
import { MdLocalShipping, MdMap, MdSettings, MdSave, MdTrackChanges, MdAttachMoney, MdInventory } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Admincontext } from '../../Components/context/admincontext';

const ShippingManagement = () => {
    const { backendurl, atoken } = useContext(Admincontext);
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Initialize tab from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setTabValue(parseInt(tab));
    }, [location.search]);

    // Data States
    const [partners, setPartners] = useState([]);
    const [rates, setRates] = useState({ zones: [], defaultRate: 0, freeShippingThreshold: 0 });
    // Comprehensive Settings State
    const [settings, setSettings] = useState({
        processingTime: 2,
        pickupAddress: {},
        codSettings: { enabled: true, minOrderValue: 0, maxOrderValue: 10000, extraCharge: 0 },
        trackingSettings: { enabled: true, provider: 'Shiprocket', autoNotify: true },
        bulkShipping: { autoGenerateLabels: false }
    });

    useEffect(() => {
        fetchData();
    }, [tabValue]);

    const getAuthToken = () => atoken || localStorage.getItem('atoken');

    const fetchData = async () => {
        setLoading(true);
        const token = getAuthToken();
        if (!token) return;

        try {
            if (tabValue === 0) {
                const { data } = await axios.get(`${backendurl}/api/admin/shipping/partners`, { headers: { Authorization: `Bearer ${token}` } });
                if (data.success) setPartners(data.data.partners);
            }
            else if (tabValue === 1) {
                const { data } = await axios.get(`${backendurl}/api/admin/shipping/rates`, { headers: { Authorization: `Bearer ${token}` } });
                if (data.success) setRates(data.data);
            }
            else {
                // For all other tabs (Tracking, COD, Bulk, General), fetch full settings
                const { data } = await axios.get(`${backendurl}/api/admin/shipping/all-settings`, { headers: { Authorization: `Bearer ${token}` } });
                if (data.success) {
                    // Merge fetched data with default state structure to avoid undefined errors
                    setSettings(prev => ({ ...prev, ...data.data }));
                }
            }
        } catch (error) {
            console.error("Fetch error", error);
            // toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handlePartnerToggle = (index) => {
        const newPartners = [...partners];
        newPartners[index].isActive = !newPartners[index].isActive;
        setPartners(newPartners);
    };

    const savePartners = async () => {
        try {
            const token = getAuthToken();
            await axios.post(`${backendurl}/api/admin/shipping/partners`, { deliveryPartners: partners }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Partners updated!");
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const saveRates = async () => {
        try {
            const token = getAuthToken();
            await axios.post(`${backendurl}/api/admin/shipping/rates`, rates, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Rates updated!");
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const saveSettings = async () => {
        try {
            const token = getAuthToken();
            await axios.post(`${backendurl}/api/admin/shipping/all-settings`, settings, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Configuration updated!");
        } catch (error) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Fulfillment & Logistics</h1>
                <p className="text-gray-500">Manage shipping carriers, zones, payments, and tracking</p>
            </div>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} className="bg-white rounded-t-xl px-4 pt-2">
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
                    <Tab icon={<MdLocalShipping size={20} />} iconPosition="start" label="Delivery Partners" />
                    <Tab icon={<MdMap size={20} />} iconPosition="start" label="Zones & Rates" />
                    <Tab icon={<MdTrackChanges size={20} />} iconPosition="start" label="Tracking Settings" />
                    <Tab icon={<MdAttachMoney size={20} />} iconPosition="start" label="COD Settings" />
                    <Tab icon={<MdInventory size={20} />} iconPosition="start" label="Bulk Shipping" />
                    <Tab icon={<MdSettings size={20} />} iconPosition="start" label="General Settings" />
                </Tabs>
            </Box>

            {/* --- TAB 0: PARTNERS --- */}
            {tabValue === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {partners.map((partner, index) => (
                        <Card key={index} className="!rounded-xl shadow-sm border border-gray-100">
                            <CardContent className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">
                                        {partner.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{partner.name}</h3>
                                        <p className="text-sm text-gray-500">Priority: {partner.priority}</p>
                                    </div>
                                </div>
                                <FormControlLabel
                                    control={<Switch checked={partner.isActive} onChange={() => handlePartnerToggle(index)} />}
                                    label={partner.isActive ? "Active" : "Inactive"}
                                />
                            </CardContent>
                        </Card>
                    ))}
                    <div className="col-span-full flex justify-end mt-4">
                        <Button variant="contained" startIcon={<MdSave />} onClick={savePartners} className="!bg-indigo-600">Save Changes</Button>
                    </div>
                </div>
            )}

            {/* --- TAB 1: ZONES & RATES --- */}
            {tabValue === 1 && (
                <div className="space-y-6">
                    <Card className="!rounded-xl shadow-sm">
                        <CardContent>
                            <h3 className="font-bold text-lg mb-4">Base Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextField
                                    label="Default Shipping Rate (₹)"
                                    type="number"
                                    value={rates.defaultRate}
                                    onChange={(e) => setRates({ ...rates, defaultRate: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Free Shipping Threshold (₹)"
                                    type="number"
                                    value={rates.freeShippingThreshold}
                                    onChange={(e) => setRates({ ...rates, freeShippingThreshold: e.target.value })}
                                    fullWidth
                                    helperText="Orders above this amount get free shipping"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">Zone-wise Rates</div>
                        <div className="divide-y divide-gray-100">
                            {rates.zones.map((zone, i) => (
                                <div key={i} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-indigo-700">{zone.zoneName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{zone.states.join(', ')}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <TextField
                                            label="Rate (₹)"
                                            size="small"
                                            type="number"
                                            value={zone.rate}
                                            className="w-32"
                                            onChange={(e) => {
                                                const newZones = [...rates.zones];
                                                newZones[i].rate = e.target.value;
                                                setRates({ ...rates, zones: newZones });
                                            }}
                                        />
                                        <TextField
                                            label="Days"
                                            size="small"
                                            type="number"
                                            value={zone.deliveryDays}
                                            className="w-24"
                                            onChange={(e) => {
                                                const newZones = [...rates.zones];
                                                newZones[i].deliveryDays = e.target.value;
                                                setRates({ ...rates, zones: newZones });
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button variant="contained" startIcon={<MdSave />} onClick={saveRates} className="!bg-indigo-600">Save Rates</Button>
                    </div>
                </div>
            )}

            {/* --- TAB 2: TRACKING --- */}
            {tabValue === 2 && (
                <Card className="!rounded-xl shadow-sm max-w-2xl">
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Real-time Order Tracking</h3>
                            <Switch
                                checked={settings.trackingSettings?.enabled || false}
                                onChange={(e) => setSettings({ ...settings, trackingSettings: { ...settings.trackingSettings, enabled: e.target.checked } })}
                            />
                        </div>
                        <Divider />
                        <TextField
                            label="Tracking Provider"
                            select
                            fullWidth
                            SelectProps={{ native: true }}
                            value={settings.trackingSettings?.provider || 'Shiprocket'}
                            onChange={(e) => setSettings({ ...settings, trackingSettings: { ...settings.trackingSettings, provider: e.target.value } })}
                        >
                            <option value="Shiprocket">Shiprocket</option>
                            <option value="Delhivery">Delhivery</option>
                            <option value="ClickPost">ClickPost</option>
                            <option value="Other">Other</option>
                        </TextField>

                        <FormControlLabel
                            control={<Switch checked={settings.trackingSettings?.autoNotify || false} onChange={(e) => setSettings({ ...settings, trackingSettings: { ...settings.trackingSettings, autoNotify: e.target.checked } })} />}
                            label="Automatically notify customers via SMS/Email on status change"
                        />

                        <div className="flex justify-end mt-6">
                            <Button variant="contained" startIcon={<MdSave />} onClick={saveSettings} className="!bg-indigo-600">Save Tracking Config</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- TAB 3: COD SETTINGS --- */}
            {tabValue === 3 && (
                <Card className="!rounded-xl shadow-sm max-w-2xl">
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Cash on Delivery (COD)</h3>
                            <Switch
                                checked={settings.codSettings?.enabled || false}
                                onChange={(e) => setSettings({ ...settings, codSettings: { ...settings.codSettings, enabled: e.target.checked } })}
                            />
                        </div>
                        <Alert severity="info" className="mb-4">
                            Enable COD to increase conversion, but set limits to reduce risk.
                        </Alert>
                        <Divider />
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                label="Minimum Order Value"
                                type="number"
                                value={settings.codSettings?.minOrderValue || 0}
                                onChange={(e) => setSettings({ ...settings, codSettings: { ...settings.codSettings, minOrderValue: e.target.value } })}
                            />
                            <TextField
                                label="Maximum Order Value"
                                type="number"
                                value={settings.codSettings?.maxOrderValue || 10000}
                                onChange={(e) => setSettings({ ...settings, codSettings: { ...settings.codSettings, maxOrderValue: e.target.value } })}
                            />
                        </div>
                        <TextField
                            label="Extra Charge for COD (₹)"
                            type="number"
                            fullWidth
                            helperText="Additional fee added to total for COD orders"
                            value={settings.codSettings?.extraCharge || 0}
                            onChange={(e) => setSettings({ ...settings, codSettings: { ...settings.codSettings, extraCharge: e.target.value } })}
                        />

                        <div className="flex justify-end mt-6">
                            <Button variant="contained" startIcon={<MdSave />} onClick={saveSettings} className="!bg-indigo-600">Save COD Config</Button>
                        </div>
                    </CardContent>
                </Card>
            )}


            {/* --- TAB 4: BULK SHIPPING --- */}
            {tabValue === 4 && (
                <div className="max-w-3xl">
                    <Card className="!rounded-xl shadow-sm mb-6">
                        <CardContent>
                            <h3 className="font-bold text-lg mb-4">Bulk Actions</h3>
                            <p className="text-gray-500 mb-6">Automate your shipping workflow for multiple orders.</p>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <h4 className="font-semibold">Auto-Generate Labels</h4>
                                        <p className="text-xs text-gray-500">Automatically generate shipping labels when order is packed</p>
                                    </div>
                                    <Switch
                                        checked={settings.bulkShipping?.autoGenerateLabels || false}
                                        onChange={(e) => setSettings({ ...settings, bulkShipping: { ...settings.bulkShipping, autoGenerateLabels: e.target.checked } })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button variant="contained" startIcon={<MdSave />} onClick={saveSettings} className="!bg-indigo-600">Save Settings</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* --- TAB 5: GENERAL SETTINGS --- */}
            {tabValue === 5 && (
                <Card className="!rounded-xl shadow-sm max-w-2xl">
                    <CardContent className="space-y-4">
                        <h3 className="font-bold text-lg mb-2">Operational Settings</h3>
                        <TextField
                            label="Processing Time (Days)"
                            fullWidth
                            type="number"
                            value={settings.processingTime}
                            onChange={(e) => setSettings({ ...settings, processingTime: e.target.value })}
                            helperText="Average time to pack and dispatch an order"
                        />
                        <Divider />
                        <h3 className="font-bold text-lg mb-2 mt-4">Pickup Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                label="Contact Person"
                                value={settings.pickupAddress?.name || ''}
                                onChange={(e) => setSettings({ ...settings, pickupAddress: { ...settings.pickupAddress, name: e.target.value } })}
                                fullWidth
                            />
                            <TextField
                                label="Phone"
                                value={settings.pickupAddress?.phone || ''}
                                onChange={(e) => setSettings({ ...settings, pickupAddress: { ...settings.pickupAddress, phone: e.target.value } })}
                                fullWidth
                            />
                            <TextField
                                label="Address"
                                className="col-span-2"
                                multiline
                                rows={2}
                                value={settings.pickupAddress?.address || ''}
                                onChange={(e) => setSettings({ ...settings, pickupAddress: { ...settings.pickupAddress, address: e.target.value } })}
                                fullWidth
                            />
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button variant="contained" startIcon={<MdSave />} onClick={saveSettings} className="!bg-indigo-600">Save Configuration</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ShippingManagement;
