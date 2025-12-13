import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { MdDelete, MdAdd } from "react-icons/md";
import { BiReceipt } from "react-icons/bi";
import { FiRefreshCw, FiSave, FiPlus } from "react-icons/fi";

function TaxConfiguration() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [newTaxRate, setNewTaxRate] = useState({ name: "", rate: 0, category: "", isDefault: false });

    const [taxConfig, setTaxConfig] = useState({
        taxName: "GST", isEnabled: true, includedInPrice: true, displayOnCheckout: true,
        taxRates: [], exemptCategories: [], taxNumber: "", taxFilingFrequency: "monthly"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/tax-config`, { headers: { token: atoken } });
            if (data.success && data.config) {
                setTaxConfig(prev => ({ ...prev, ...data.config }));
            }
        } catch (e) {
            console.error("Error fetching tax config:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/tax-config`, taxConfig, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Tax configuration saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save tax configuration");
        } finally {
            setSaving(false);
        }
    };

    const addTaxRate = () => {
        if (!newTaxRate.name || !newTaxRate.rate) return;
        setTaxConfig({
            ...taxConfig,
            taxRates: [...taxConfig.taxRates, { ...newTaxRate }]
        });
        setNewTaxRate({ name: "", rate: 0, category: "", isDefault: false });
        setOpenDialog(false);
    };

    const removeTaxRate = (index) => {
        const updated = taxConfig.taxRates.filter((_, i) => i !== index);
        setTaxConfig({ ...taxConfig, taxRates: updated });
    };

    const setDefaultRate = (index) => {
        const updated = taxConfig.taxRates.map((rate, i) => ({
            ...rate,
            isDefault: i === index
        }));
        setTaxConfig({ ...taxConfig, taxRates: updated });
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><BiReceipt size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Tax Configuration</h2>
                        <p className="text-sm text-gray-500">Configure GST and other tax settings.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-4xl">
                {/* General Settings */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">General Settings</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <TextField fullWidth label="Tax Name" value={taxConfig.taxName} onChange={(e) => setTaxConfig({ ...taxConfig, taxName: e.target.value })} />
                            <TextField fullWidth label="Tax Registration Number (GST)" value={taxConfig.taxNumber} onChange={(e) => setTaxConfig({ ...taxConfig, taxNumber: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <FormControlLabel control={<Switch checked={taxConfig.isEnabled} onChange={(e) => setTaxConfig({ ...taxConfig, isEnabled: e.target.checked })} />} label="Enable Tax Calculation" />
                            <FormControlLabel control={<Switch checked={taxConfig.includedInPrice} onChange={(e) => setTaxConfig({ ...taxConfig, includedInPrice: e.target.checked })} />} label="Tax Included in Product Price" />
                            <FormControlLabel control={<Switch checked={taxConfig.displayOnCheckout} onChange={(e) => setTaxConfig({ ...taxConfig, displayOnCheckout: e.target.checked })} />} label="Display Tax Breakdown on Checkout" />
                        </div>
                    </CardContent>
                </Card>

                {/* Tax Rates */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Tax Rates</h3>
                            <Button startIcon={<FiPlus />} onClick={() => setOpenDialog(true)}>Add Tax Rate</Button>
                        </div>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Rate (%)</strong></TableCell>
                                        <TableCell><strong>Category</strong></TableCell>
                                        <TableCell><strong>Default</strong></TableCell>
                                        <TableCell><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(taxConfig.taxRates || []).map((rate, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell>{rate.name}</TableCell>
                                            <TableCell>{rate.rate}%</TableCell>
                                            <TableCell className="capitalize">{rate.category || "-"}</TableCell>
                                            <TableCell>
                                                <Switch checked={rate.isDefault} onChange={() => setDefaultRate(idx)} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => removeTaxRate(idx)}><MdDelete /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(taxConfig.taxRates || []).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500 py-8">No tax rates configured</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Filing Frequency */}
                <Card className="mb-6">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-4">Tax Filing</h3>
                        <FormControl fullWidth sx={{ maxWidth: 300 }}>
                            <InputLabel>Filing Frequency</InputLabel>
                            <Select value={taxConfig.taxFilingFrequency || "monthly"} onChange={(e) => setTaxConfig({ ...taxConfig, taxFilingFrequency: e.target.value })}>
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="quarterly">Quarterly</MenuItem>
                                <MenuItem value="annually">Annually</MenuItem>
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>

                <Button variant="contained" size="large" startIcon={<FiSave />} onClick={saveConfig} disabled={saving}>
                    {saving ? "Saving..." : "Save Configuration"}
                </Button>
            </div>

            {/* Add Tax Rate Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Tax Rate</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <TextField fullWidth label="Tax Name" placeholder="GST 18%" value={newTaxRate.name} onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })} />
                        <TextField fullWidth label="Rate (%)" type="number" value={newTaxRate.rate} onChange={(e) => setNewTaxRate({ ...newTaxRate, rate: parseFloat(e.target.value) })} />
                        <TextField fullWidth label="Category" placeholder="e.g., electronics, clothing" value={newTaxRate.category} onChange={(e) => setNewTaxRate({ ...newTaxRate, category: e.target.value })} />
                        <FormControlLabel control={<Switch checked={newTaxRate.isDefault} onChange={(e) => setNewTaxRate({ ...newTaxRate, isDefault: e.target.checked })} />} label="Set as Default" />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={addTaxRate}>Add Tax Rate</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default TaxConfiguration;
