import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, Switch, FormControlLabel, LinearProgress, Alert, TextField } from "@mui/material";
import { MdColorLens, MdShoppingCart, MdViewCompact, MdNotifications } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function CustomizationSettings() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [customization, setCustomization] = useState({
        theme: {
            primaryColor: "#3B82F6",
            secondaryColor: "#10B981",
            accentColor: "#F59E0B",
            backgroundColor: "#FFFFFF",
            textColor: "#1F2937",
            fontFamily: "Inter"
        },
        checkout: {
            guestCheckout: true,
            showOrderSummary: true,
            showCouponField: true,
            showGiftWrap: true,
            termsRequired: true
        },
        productPage: {
            showStock: true,
            showSKU: false,
            showReviews: true,
            showRelated: true,
            showShare: true,
            enableZoom: true
        },
        notifications: {
            showNewOrders: true,
            playSound: false,
            desktopNotifications: true
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/customization`, { headers: { token: atoken } });
            if (data.success && data.settings) {
                setCustomization(prev => ({ ...prev, ...data.settings }));
            }
        } catch (e) {
            console.error("Error fetching customization settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/customization`, customization, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Customization settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save customization settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MdColorLens size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Customization Settings</h2>
                        <p className="text-sm text-gray-500">Customize the look and behavior of your storefront.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-4xl">
                {/* Theme Colors */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdColorLens size={24} className="text-purple-500" />
                            <h3 className="text-lg font-bold">Theme Colors</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Primary Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customization.theme?.primaryColor || "#3B82F6"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, primaryColor: e.target.value } })} className="w-12 h-10 rounded cursor-pointer border-0" />
                                    <span className="text-xs font-mono">{customization.theme?.primaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Secondary Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customization.theme?.secondaryColor || "#10B981"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, secondaryColor: e.target.value } })} className="w-12 h-10 rounded cursor-pointer border-0" />
                                    <span className="text-xs font-mono">{customization.theme?.secondaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Accent Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customization.theme?.accentColor || "#F59E0B"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, accentColor: e.target.value } })} className="w-12 h-10 rounded cursor-pointer border-0" />
                                    <span className="text-xs font-mono">{customization.theme?.accentColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Background</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customization.theme?.backgroundColor || "#FFFFFF"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, backgroundColor: e.target.value } })} className="w-12 h-10 rounded cursor-pointer border-0" />
                                    <span className="text-xs font-mono">{customization.theme?.backgroundColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customization.theme?.textColor || "#1F2937"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, textColor: e.target.value } })} className="w-12 h-10 rounded cursor-pointer border-0" />
                                    <span className="text-xs font-mono">{customization.theme?.textColor}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <TextField label="Font Family" value={customization.theme?.fontFamily || "Inter"} onChange={(e) => setCustomization({ ...customization, theme: { ...customization.theme, fontFamily: e.target.value } })} helperText="e.g., Inter, Roboto, Open Sans" sx={{ width: 250 }} />
                        </div>
                        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: customization.theme?.backgroundColor, color: customization.theme?.textColor, border: `2px solid ${customization.theme?.primaryColor}` }}>
                            <p style={{ fontFamily: customization.theme?.fontFamily }}>
                                <span style={{ color: customization.theme?.primaryColor }}>Primary</span> |
                                <span style={{ color: customization.theme?.secondaryColor }}> Secondary</span> |
                                <span style={{ color: customization.theme?.accentColor }}> Accent</span> - Theme Preview
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Checkout Options */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdShoppingCart size={24} className="text-green-500" />
                            <h3 className="text-lg font-bold">Checkout Options</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                            <FormControlLabel control={<Switch checked={customization.checkout?.guestCheckout} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, guestCheckout: e.target.checked } })} />} label="Allow Guest Checkout" />
                            <FormControlLabel control={<Switch checked={customization.checkout?.showOrderSummary} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, showOrderSummary: e.target.checked } })} />} label="Show Order Summary" />
                            <FormControlLabel control={<Switch checked={customization.checkout?.showCouponField} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, showCouponField: e.target.checked } })} />} label="Show Coupon Field" />
                            <FormControlLabel control={<Switch checked={customization.checkout?.showGiftWrap} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, showGiftWrap: e.target.checked } })} />} label="Show Gift Wrap Option" />
                            <FormControlLabel control={<Switch checked={customization.checkout?.termsRequired} onChange={(e) => setCustomization({ ...customization, checkout: { ...customization.checkout, termsRequired: e.target.checked } })} />} label="Require Terms Agreement" />
                        </div>
                    </CardContent>
                </Card>

                {/* Product Page */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdViewCompact size={24} className="text-blue-500" />
                            <h3 className="text-lg font-bold">Product Page</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                            <FormControlLabel control={<Switch checked={customization.productPage?.showStock} onChange={(e) => setCustomization({ ...customization, productPage: { ...customization.productPage, showStock: e.target.checked } })} />} label="Show Stock Count" />
                            <FormControlLabel control={<Switch checked={customization.productPage?.showSKU} onChange={(e) => setCustomization({ ...customization, productPage: { ...customization.productPage, showSKU: e.target.checked } })} />} label="Show SKU" />
                            <FormControlLabel control={<Switch checked={customization.productPage?.showReviews} onChange={(e) => setCustomization({ ...customization, productPage: { ...customization.productPage, showReviews: e.target.checked } })} />} label="Show Reviews" />
                            <FormControlLabel control={<Switch checked={customization.productPage?.showRelated} onChange={(e) => setCustomization({ ...customization, productPage: { ...customization.productPage, showRelated: e.target.checked } })} />} label="Show Related Products" />
                            <FormControlLabel control={<Switch checked={customization.productPage?.showShare} onChange={(e) => setCustomization({ ...customization, productPage: { ...customization.productPage, showShare: e.target.checked } })} />} label="Show Share Buttons" />
                            <FormControlLabel control={<Switch checked={customization.productPage?.enableZoom} onChange={(e) => setCustomization({ ...customization, productPage: { ...customization.productPage, enableZoom: e.target.checked } })} />} label="Enable Image Zoom" />
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Notifications */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdNotifications size={24} className="text-orange-500" />
                            <h3 className="text-lg font-bold">Admin Notifications</h3>
                        </div>
                        <div className="space-y-2">
                            <FormControlLabel control={<Switch checked={customization.notifications?.showNewOrders} onChange={(e) => setCustomization({ ...customization, notifications: { ...customization.notifications, showNewOrders: e.target.checked } })} />} label="Show New Order Notifications" />
                            <FormControlLabel control={<Switch checked={customization.notifications?.playSound} onChange={(e) => setCustomization({ ...customization, notifications: { ...customization.notifications, playSound: e.target.checked } })} />} label="Play Sound for Notifications" />
                            <FormControlLabel control={<Switch checked={customization.notifications?.desktopNotifications} onChange={(e) => setCustomization({ ...customization, notifications: { ...customization.notifications, desktopNotifications: e.target.checked } })} />} label="Enable Desktop Notifications" />
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

export default CustomizationSettings;
