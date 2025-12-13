import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, TextField, Card, CardContent, Switch, FormControlLabel, LinearProgress, Alert, Select, MenuItem, FormControl, InputLabel, Slider } from "@mui/material";
import { MdTune, MdRecommend, MdHistory, MdShoppingCart, MdCake, MdEmail } from "react-icons/md";
import { FiRefreshCw, FiSave, FiSettings } from "react-icons/fi";

function PersonalizationTools() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [personalization, setPersonalization] = useState({
        enableRecommendations: true,
        recommendationAlgorithm: 'hybrid',
        maxRecommendations: 10,
        enableRecentlyViewed: true,
        recentlyViewedLimit: 10,
        enableWishlistReminders: true,
        enableAbandonedCartReminders: true,
        abandonedCartDelay: 24,
        enablePersonalizedEmails: true,
        enableBirthdayOffers: true,
        birthdayDiscountPercent: 10
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/personalization`, { headers: { token: atoken } });
            if (data.success && data.settings) {
                setPersonalization(prev => ({ ...prev, ...data.settings }));
            }
        } catch (e) {
            console.error("Error fetching personalization settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${backendurl}/api/admin/settings/personalization`, personalization, { headers: { token: atoken } });
            if (data.success) {
                setSuccess("Personalization settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save personalization settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-50 text-pink-600 rounded-lg"><MdTune size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Personalization Tools</h2>
                        <p className="text-sm text-gray-500">Configure personalized experiences for your customers.</p>
                    </div>
                </div>
                <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-4xl">
                {/* Product Recommendations */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdRecommend size={24} className="text-blue-500" />
                            <h3 className="text-lg font-bold">Product Recommendations</h3>
                        </div>
                        <FormControlLabel
                            control={<Switch checked={personalization.enableRecommendations} onChange={(e) => setPersonalization({ ...personalization, enableRecommendations: e.target.checked })} />}
                            label="Enable Product Recommendations"
                        />
                        {personalization.enableRecommendations && (
                            <div className="mt-4 grid md:grid-cols-2 gap-4">
                                <FormControl fullWidth>
                                    <InputLabel>Algorithm</InputLabel>
                                    <Select value={personalization.recommendationAlgorithm} onChange={(e) => setPersonalization({ ...personalization, recommendationAlgorithm: e.target.value })}>
                                        <MenuItem value="collaborative">Collaborative Filtering</MenuItem>
                                        <MenuItem value="content-based">Content-Based</MenuItem>
                                        <MenuItem value="hybrid">Hybrid (Recommended)</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField label="Max Recommendations" type="number" value={personalization.maxRecommendations} onChange={(e) => setPersonalization({ ...personalization, maxRecommendations: parseInt(e.target.value) })} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recently Viewed */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdHistory size={24} className="text-purple-500" />
                            <h3 className="text-lg font-bold">Recently Viewed Products</h3>
                        </div>
                        <FormControlLabel
                            control={<Switch checked={personalization.enableRecentlyViewed} onChange={(e) => setPersonalization({ ...personalization, enableRecentlyViewed: e.target.checked })} />}
                            label="Show Recently Viewed Products"
                        />
                        {personalization.enableRecentlyViewed && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Max products to display: {personalization.recentlyViewedLimit}</p>
                                <Slider value={personalization.recentlyViewedLimit} onChange={(e, val) => setPersonalization({ ...personalization, recentlyViewedLimit: val })} min={4} max={20} marks step={2} valueLabelDisplay="auto" sx={{ maxWidth: 300 }} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Abandoned Cart */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdShoppingCart size={24} className="text-orange-500" />
                            <h3 className="text-lg font-bold">Abandoned Cart Recovery</h3>
                        </div>
                        <FormControlLabel
                            control={<Switch checked={personalization.enableAbandonedCartReminders} onChange={(e) => setPersonalization({ ...personalization, enableAbandonedCartReminders: e.target.checked })} />}
                            label="Send Abandoned Cart Reminders"
                        />
                        {personalization.enableAbandonedCartReminders && (
                            <div className="mt-4">
                                <TextField label="Send reminder after (hours)" type="number" value={personalization.abandonedCartDelay} onChange={(e) => setPersonalization({ ...personalization, abandonedCartDelay: parseInt(e.target.value) })} helperText="Time after cart abandonment to send first reminder" sx={{ width: 250 }} />
                            </div>
                        )}
                        <FormControlLabel
                            control={<Switch checked={personalization.enableWishlistReminders} onChange={(e) => setPersonalization({ ...personalization, enableWishlistReminders: e.target.checked })} sx={{ mt: 2 }} />}
                            label="Send Wishlist Reminders"
                        />
                    </CardContent>
                </Card>

                {/* Birthday Offers */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdCake size={24} className="text-pink-500" />
                            <h3 className="text-lg font-bold">Birthday Offers</h3>
                        </div>
                        <FormControlLabel
                            control={<Switch checked={personalization.enableBirthdayOffers} onChange={(e) => setPersonalization({ ...personalization, enableBirthdayOffers: e.target.checked })} />}
                            label="Send Birthday Discount Offers"
                        />
                        {personalization.enableBirthdayOffers && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Birthday discount: {personalization.birthdayDiscountPercent}%</p>
                                <Slider value={personalization.birthdayDiscountPercent} onChange={(e, val) => setPersonalization({ ...personalization, birthdayDiscountPercent: val })} min={5} max={50} marks={[{ value: 5, label: '5%' }, { value: 25, label: '25%' }, { value: 50, label: '50%' }]} valueLabelDisplay="auto" sx={{ maxWidth: 300 }} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Personalized Emails */}
                <Card className="mb-6">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <MdEmail size={24} className="text-green-500" />
                            <h3 className="text-lg font-bold">Personalized Communications</h3>
                        </div>
                        <FormControlLabel
                            control={<Switch checked={personalization.enablePersonalizedEmails} onChange={(e) => setPersonalization({ ...personalization, enablePersonalizedEmails: e.target.checked })} />}
                            label="Enable Personalized Email Recommendations"
                        />
                        <p className="text-sm text-gray-500 mt-2">Send personalized product recommendations based on user browsing and purchase history.</p>
                    </CardContent>
                </Card>

                <Button variant="contained" size="large" startIcon={<FiSave />} onClick={saveSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}

export default PersonalizationTools;
