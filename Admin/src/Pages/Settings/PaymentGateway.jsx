import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, Switch, TextField, Chip, LinearProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel } from "@mui/material";
import { MdPayment, MdEdit } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function PaymentGateway() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [paymentGateways, setPaymentGateways] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [gatewayForm, setGatewayForm] = useState({
        isActive: false, testMode: true,
        credentials: { keyId: "", keySecret: "", webhookSecret: "", merchantId: "" },
        displayName: "", description: ""
    });

    const gateways = [
        { gateway: 'razorpay', name: 'Razorpay', icon: '💳', color: 'bg-blue-500' },
        { gateway: 'stripe', name: 'Stripe', icon: '💎', color: 'bg-purple-500' },
        { gateway: 'paypal', name: 'PayPal', icon: '🅿️', color: 'bg-blue-600' },
        { gateway: 'paytm', name: 'Paytm', icon: '📱', color: 'bg-cyan-500' },
        { gateway: 'cod', name: 'Cash on Delivery', icon: '💵', color: 'bg-green-500' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/payment-gateways`, { headers: { token: atoken } });
            if (data.success) setPaymentGateways(data.gateways || []);
        } catch (e) {
            console.error("Error fetching payment gateways:", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleGateway = async (gateway, isActive) => {
        try {
            await axios.put(`${backendurl}/api/admin/settings/payment-gateway/${gateway}/toggle`, { isActive }, { headers: { token: atoken } });
            fetchData();
            setSuccess(`${gateway} ${isActive ? 'enabled' : 'disabled'} successfully!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to update gateway");
        }
    };

    const openConfigDialog = (gateway) => {
        const existing = paymentGateways.find(p => p.gateway === gateway.gateway);
        setSelectedGateway(gateway);
        setGatewayForm({
            isActive: existing?.isActive || false,
            testMode: existing?.testMode ?? true,
            credentials: existing?.credentials || { keyId: "", keySecret: "", webhookSecret: "", merchantId: "" },
            displayName: existing?.displayName || gateway.name,
            description: existing?.description || ""
        });
        setOpenDialog(true);
    };

    const saveGatewayConfig = async () => {
        try {
            await axios.put(`${backendurl}/api/admin/settings/payment-gateway/${selectedGateway.gateway}`, gatewayForm, { headers: { token: atoken } });
            fetchData();
            setOpenDialog(false);
            setSuccess("Gateway configuration saved!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert("Failed to save gateway configuration");
        }
    };

    const getGatewayStatus = (gateway) => {
        return paymentGateways.find(p => p.gateway === gateway) || { isActive: false, testMode: true };
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><MdPayment size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Payment Gateway</h2>
                        <p className="text-sm text-gray-500">Configure payment methods for your store.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gateways.map(gw => {
                    const status = getGatewayStatus(gw.gateway);
                    return (
                        <Card key={gw.gateway} className={`${status.isActive ? 'border-green-500 border-2' : 'border-gray-200'} hover:shadow-lg transition-all`}>
                            <CardContent>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 ${gw.color} rounded-xl flex items-center justify-center text-2xl`}>
                                            {gw.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{gw.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{gw.gateway}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Chip size="small" label={status.isActive ? "Active" : "Inactive"} color={status.isActive ? "success" : "default"} />
                                    {status.isActive && (
                                        <Chip size="small" label={status.testMode ? "Test Mode" : "Live"} color={status.testMode ? "warning" : "success"} variant="outlined" />
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <Switch
                                        checked={status.isActive}
                                        onChange={(e) => toggleGateway(gw.gateway, e.target.checked)}
                                        color="success"
                                    />
                                    <Button size="small" startIcon={<MdEdit />} onClick={() => openConfigDialog(gw)}>
                                        Configure
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Configuration Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Configure {selectedGateway?.name}</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <FormControlLabel
                            control={<Switch checked={gatewayForm.isActive} onChange={(e) => setGatewayForm({ ...gatewayForm, isActive: e.target.checked })} />}
                            label="Enable Gateway"
                        />
                        <FormControlLabel
                            control={<Switch checked={gatewayForm.testMode} onChange={(e) => setGatewayForm({ ...gatewayForm, testMode: e.target.checked })} color="warning" />}
                            label="Test Mode"
                        />

                        <TextField fullWidth label="Display Name" value={gatewayForm.displayName} onChange={(e) => setGatewayForm({ ...gatewayForm, displayName: e.target.value })} />
                        <TextField fullWidth label="Description" multiline rows={2} value={gatewayForm.description} onChange={(e) => setGatewayForm({ ...gatewayForm, description: e.target.value })} />

                        {selectedGateway?.gateway !== 'cod' && (
                            <>
                                <h4 className="font-bold mt-4">API Credentials</h4>
                                <TextField fullWidth label="Key ID / API Key" value={gatewayForm.credentials.keyId} onChange={(e) => setGatewayForm({ ...gatewayForm, credentials: { ...gatewayForm.credentials, keyId: e.target.value } })} />
                                <TextField fullWidth label="Key Secret" type="password" value={gatewayForm.credentials.keySecret} onChange={(e) => setGatewayForm({ ...gatewayForm, credentials: { ...gatewayForm.credentials, keySecret: e.target.value } })} />
                                <TextField fullWidth label="Webhook Secret (optional)" value={gatewayForm.credentials.webhookSecret} onChange={(e) => setGatewayForm({ ...gatewayForm, credentials: { ...gatewayForm.credentials, webhookSecret: e.target.value } })} />
                            </>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveGatewayConfig}>Save Configuration</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default PaymentGateway;
